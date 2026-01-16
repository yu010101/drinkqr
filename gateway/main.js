const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 設定
const SUPABASE_URL = 'https://jhewqzikdfqcevecamzd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZXdxemlrZGZxY2V2ZWNhbXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODU3Mzg2OCwiZXhwIjoyMDg0MTQ5ODY4fQ._Y4Z2aC-ZzbwlspqXibQXMeE9iR41eQFv6NhV3uu_iA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

let mainWindow;
let tray;
let orderCount = 0;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'DrinkQR 印刷サーバー',
  });

  mainWindow.loadFile('app.html');

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADgSURBVDiNpZMxDoJAEEX/7FoTG+zchVi4hTewideg9A54BS/gHWy4gQuBUhobY6EUGgp2KVYNIYTdwEsmM5n/5k9mAgQVrD0c0RuOWCWJUGkMU/NrHGO3XLF9/wDgXwKg8pTjEId7PF5eSJI0DXLF+d1J4h7Y0QCw4wkiIJT8B0LoQwjJfSMcY8QWY1RKbCM0E0T0wKZQ/AvhJVDyH4QnEEI6APxlYAMC6D/hEAJ4+wPBGwgZZ5zCMbqORs8YbV5Z2HqCt//IrfPOe8Ph9fkW2HLJZDoTCL0R6FZ0YJv0/gBX6DlVMfrVSgAAAABJRU5ErkJggg=='
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: '画面を開く', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: '終了', click: () => {
      mainWindow.destroy();
      app.quit();
    }},
  ]);

  tray.setToolTip('DrinkQR 印刷サーバー');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.show();
  });
}

// 印刷処理
async function printOrder(printJob) {
  const { id, printable_text } = printJob;

  // Electronの印刷機能を使用
  const printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: 72mm auto; margin: 0; }
        body {
          font-family: monospace;
          font-size: 12px;
          width: 72mm;
          padding: 5mm;
          margin: 0;
        }
        .header { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 10px; }
        .table { text-align: center; font-size: 24px; font-weight: bold; border: 2px solid black; padding: 10px; margin-bottom: 10px; }
        .item { display: flex; justify-content: space-between; padding: 3px 0; }
        .divider { border-top: 1px dashed black; margin: 5px 0; }
        .footer { font-size: 10px; color: #666; margin-top: 10px; }
      </style>
    </head>
    <body>
      <pre>${printable_text}</pre>
    </body>
    </html>
  `;

  printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  printWindow.webContents.on('did-finish-load', () => {
    printWindow.webContents.print(
      {
        silent: true,        // ダイアログなし
        printBackground: true,
      },
      (success, errorType) => {
        printWindow.close();

        if (success) {
          console.log(`Printed: ${id.slice(-6)}`);
          updatePrintJobStatus(id, 'printed');
          sendToRenderer('print-success', { id, printable_text });
        } else {
          console.error(`Print failed: ${errorType}`);
          updatePrintJobStatus(id, 'failed', errorType);
          sendToRenderer('print-error', { id, error: errorType });
        }
      }
    );
  });
}

// ステータス更新
async function updatePrintJobStatus(id, status, error = null) {
  const updateData = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (error) {
    updateData.last_error = error;
  }

  if (status === 'failed') {
    const { data: job } = await supabase
      .from('print_jobs')
      .select('attempts')
      .eq('id', id)
      .single();

    if (job) {
      updateData.attempts = job.attempts + 1;
      if (job.attempts >= 4) {
        updateData.status = 'dead';
      }
    }
  }

  await supabase.from('print_jobs').update(updateData).eq('id', id);
}

// レンダラーにメッセージ送信
function sendToRenderer(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

// 未処理ジョブを処理
async function processQueuedJobs() {
  const { data: jobs, error } = await supabase
    .from('print_jobs')
    .select('*')
    .eq('status', 'queued')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  if (jobs && jobs.length > 0) {
    console.log(`Found ${jobs.length} queued jobs`);
    for (const job of jobs) {
      await printOrder(job);
    }
  }
}

// Realtime購読
function startRealtimeSubscription() {
  const channel = supabase
    .channel('print_jobs_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'print_jobs',
        filter: 'status=eq.queued',
      },
      async (payload) => {
        console.log('New print job!');
        orderCount++;
        sendToRenderer('new-order', payload.new);
        await printOrder(payload.new);
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
      sendToRenderer('connection-status', status);
    });

  return channel;
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // 起動時に未処理ジョブを処理
  processQueuedJobs();

  // Realtime購読開始
  startRealtimeSubscription();

  sendToRenderer('server-started', { url: SUPABASE_URL });
});

app.on('window-all-closed', () => {
  // macOSでは閉じてもアプリを終了しない
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
