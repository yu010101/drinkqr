import { OrderRequest } from './types';

/**
 * テーブル名のバリデーション
 */
export function validateTableName(table: string): { valid: boolean; error?: string } {
  if (!table || table.trim().length === 0) {
    return { valid: false, error: 'テーブル名は必須です' };
  }
  
  if (table.length > 10) {
    return { valid: false, error: 'テーブル名は10文字以内で指定してください' };
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(table)) {
    return { valid: false, error: 'テーブル名は英数字のみ使用できます' };
  }
  
  return { valid: true };
}

/**
 * 注文リクエストのバリデーション
 */
export function validateOrderRequest(request: unknown): { valid: boolean; error?: string; data?: OrderRequest } {
  if (!request || typeof request !== 'object') {
    return { valid: false, error: 'リクエストボディが不正です' };
  }
  
  const req = request as Partial<OrderRequest>;
  
  // table のバリデーション
  const tableValidation = validateTableName(req.table || '');
  if (!tableValidation.valid) {
    return { valid: false, error: tableValidation.error };
  }
  
  // items のバリデーション
  if (!Array.isArray(req.items) || req.items.length === 0) {
    return { valid: false, error: '注文アイテムは1件以上必要です' };
  }
  
  for (let i = 0; i < req.items.length; i++) {
    const item = req.items[i];
    
    // name のバリデーション
    if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
      return { valid: false, error: `アイテム${i + 1}の名前が不正です` };
    }
    
    if (item.name.length > 100) {
      return { valid: false, error: `アイテム${i + 1}の名前は100文字以内で指定してください` };
    }
    
    // qty のバリデーション
    if (typeof item.qty !== 'number' || !Number.isInteger(item.qty)) {
      return { valid: false, error: `アイテム${i + 1}の数量は整数で指定してください` };
    }
    
    if (item.qty < 1 || item.qty > 100) {
      return { valid: false, error: `アイテム${i + 1}の数量は1〜100の範囲で指定してください` };
    }
  }
  
  return {
    valid: true,
    data: {
      table: req.table!,
      items: req.items,
    },
  };
}
