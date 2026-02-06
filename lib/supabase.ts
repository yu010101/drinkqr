import { createClient } from '@supabase/supabase-js';
import { Order, PrintJob } from '@/packages/shared/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// テスト環境では環境変数がなくてもエラーにしない
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Missing Supabase environment variables');
  }
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * 注文をデータベースに保存する
 */
export async function createOrder(tableName: string, items: Array<{ name: string; qty: number }>): Promise<Order> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      table_name: tableName,
      items,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
  
  return data;
}

/**
 * 印刷ジョブを作成する
 */
export async function createPrintJob(orderId: string, printableText: string): Promise<PrintJob> {
  if (!supabase) {
    throw new Error('Supabase client is not initialized');
  }
  
  const { data, error } = await supabase
    .from('print_jobs')
    .insert({
      order_id: orderId,
      printable_text: printableText,
      status: 'queued',
      attempts: 0,
    })
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create print job: ${error.message}`);
  }
  
  return data;
}
