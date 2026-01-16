import { OrderItem } from './types';

/**
 * 印刷テキストを生成する
 * @param tableName テーブル名
 * @param items 注文アイテム
 * @returns 印刷用テキスト
 */
export function generatePrintableText(tableName: string, items: OrderItem[]): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');
  
  const itemsText = items
    .map(item => `- ${item.name} x${item.qty}`)
    .join('\n');
  
  return `[飲み放題注文]
卓: ${tableName}
時刻: ${dateStr}

${itemsText}
`;
}
