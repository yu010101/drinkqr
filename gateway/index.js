import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 環境変数
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PRINTER_MODE = process.env.PRINTER_MODE || 'console'; // 'console' | 'usb' | 'bluetooth'

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
  console.error('Create a .env file with these values');
  process.exit(1);
}

// Supabaseクライアント
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 印刷関数
async function printReceipt(printJob) {
  const { id, printable_text } = printJob;

  console.log('\n' + '='.repeat(40));
  console.log('PRINTING JOB:', id.slice(-8));
  console.log('='.repeat(40));

  if (PRINTER_MODE === 'console') {
    // コンソール出力（テスト用）
    console.log(printable_text);
    console.log('='.repeat(40) + '\n');
    return true;
  }

  if (PRINTER_MODE === 'usb') {
    // USB接続プリンター
    try {
      const escpos = await import('escpos');
      const USB = (await import('escpos-usb')).default;

      const device = new USB();
      const printer = new escpos.Printer(device);

      await new Promise((resolve, reject) => {
        device.open((err) => {
          if (err) return reject(err);

          printer
            .font('a')
            .align('lt')
            .text(printable_text)
            .cut()
            .close(resolve);
        });
      });

      return true;
    } catch (err) {
      console.error('USB Print Error:', err.message);
      return false;
    }
  }

  // その他のモードは未実装
  console.log(printable_text);
  console.log('='.repeat(40) + '\n');
  return true;
}

// print_jobのステータス更新
async function updatePrintJobStatus(id, status, error = null) {
  const { error: updateError } = await supabase
    .from('print_jobs')
    .update({
      status,
      last_error: error,
      updated_at: new Date().toISOString(),
      ...(status === 'failed' ? { attempts: supabase.rpc('increment_attempts', { job_id: id }) } : {})
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to update print job status:', updateError);
  }
}

// print_jobの処理
async function processPrintJob(printJob) {
  console.log(`Processing print job: ${printJob.id.slice(-8)}`);

  try {
    const success = await printReceipt(printJob);

    if (success) {
      // 印刷成功
      const { error } = await supabase
        .from('print_jobs')
        .update({
          status: 'printed',
          updated_at: new Date().toISOString()
        })
        .eq('id', printJob.id);

      if (error) {
        console.error('Failed to update status to printed:', error);
      } else {
        console.log(`Print job ${printJob.id.slice(-8)} completed`);
      }
    } else {
      // 印刷失敗
      const { error } = await supabase
        .from('print_jobs')
        .update({
          status: printJob.attempts >= 4 ? 'dead' : 'failed',
          attempts: printJob.attempts + 1,
          last_error: 'Print failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', printJob.id);

      if (error) {
        console.error('Failed to update status to failed:', error);
      }
    }
  } catch (err) {
    console.error('Error processing print job:', err);

    // エラー時はfailedに
    await supabase
      .from('print_jobs')
      .update({
        status: printJob.attempts >= 4 ? 'dead' : 'failed',
        attempts: printJob.attempts + 1,
        last_error: err.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', printJob.id);
  }
}

// 未処理のprint_jobsを取得して処理
async function processQueuedJobs() {
  const { data: jobs, error } = await supabase
    .from('print_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch queued jobs:', error);
    return;
  }

  if (jobs && jobs.length > 0) {
    console.log(`Found ${jobs.length} queued job(s)`);
    for (const job of jobs) {
      await processPrintJob(job);
    }
  }
}

// メイン
async function main() {
  console.log('');
  console.log('========================================');
  console.log('   DrinkQR Print Gateway');
  console.log('========================================');
  console.log(`Mode: ${PRINTER_MODE}`);
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log('');

  // 起動時に未処理のジョブを処理
  console.log('Checking for queued jobs...');
  await processQueuedJobs();

  // Realtimeで新規print_jobsを購読
  console.log('Subscribing to print_jobs...');

  const channel = supabase
    .channel('print_jobs_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'print_jobs',
        filter: 'status=eq.queued'
      },
      async (payload) => {
        console.log('New print job received!');
        await processPrintJob(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'print_jobs',
        filter: 'status=eq.queued'
      },
      async (payload) => {
        // failedからqueuedに戻されたジョブを処理
        if (payload.old.status !== 'queued' && payload.new.status === 'queued') {
          console.log('Retrying print job...');
          await processPrintJob(payload.new);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('');
        console.log('Gateway is running. Waiting for orders...');
        console.log('Press Ctrl+C to stop.');
        console.log('');
      } else {
        console.log('Subscription status:', status);
      }
    });

  // 終了処理
  process.on('SIGINT', () => {
    console.log('\nShutting down gateway...');
    channel.unsubscribe();
    process.exit(0);
  });
}

main().catch(console.error);
