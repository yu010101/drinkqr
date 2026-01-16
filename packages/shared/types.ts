/**
 * 共通型定義
 */

export interface OrderItem {
  name: string;
  qty: number;
}

export interface Order {
  id: string;
  table_name: string;
  items: OrderItem[];
  created_at: string;
}

export interface PrintJob {
  id: string;
  order_id: string;
  printable_text: string;
  status: 'queued' | 'printed' | 'failed' | 'dead';
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderRequest {
  table: string;
  items: OrderItem[];
}

export interface OrderResponse {
  success: boolean;
  order_id?: string;
  error?: string;
}

export interface MenuItem {
  name: string;
  price?: number;
  category?: string;
}

export type PrintJobStatus = 'queued' | 'printed' | 'failed' | 'dead';
