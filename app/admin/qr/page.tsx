'use client';

import { useEffect, useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createSupabaseBrowserClient } from '@/lib/auth-client';
import type { Store } from '@/lib/auth-client';

export default function QRCodePage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<string[]>(['A1', 'A2', 'A3', 'A4', 'A5']);
  const [newTable, setNewTable] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStore = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        setStore(data);
      }
      setLoading(false);
    };

    fetchStore();
    setBaseUrl(window.location.origin);
  }, []);

  const addTable = () => {
    if (newTable && !tables.includes(newTable.toUpperCase())) {
      setTables([...tables, newTable.toUpperCase()]);
      setNewTable('');
    }
  };

  const removeTable = (table: string) => {
    setTables(tables.filter((t) => t !== table));
  };

  const getQRUrl = (table: string) => {
    if (!store) return '';
    return `${baseUrl}/s/${store.slug}/t/${table}`;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QRコード - ${store?.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Zen Kaku Gothic New', sans-serif; }
            .page {
              page-break-after: always;
              width: 100mm;
              height: 100mm;
              padding: 10mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .page:last-child { page-break-after: auto; }
            .store-name {
              font-family: 'Shippori Mincho', serif;
              font-size: 14pt;
              margin-bottom: 5mm;
              color: #333;
            }
            .table-name {
              font-size: 24pt;
              font-weight: bold;
              margin-bottom: 5mm;
              color: #d4af37;
            }
            .qr-code { margin: 5mm 0; }
            .instruction {
              font-size: 10pt;
              color: #666;
              margin-top: 5mm;
            }
            @media print {
              @page { size: 100mm 100mm; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${tables.map((table) => `
            <div class="page">
              <div class="store-name">${store?.name || ''}</div>
              <div class="table-name">${table}</div>
              <div class="qr-code">
                <svg viewBox="0 0 256 256" width="50mm" height="50mm">
                  ${document.querySelector(`[data-table="${table}"] svg`)?.innerHTML || ''}
                </svg>
              </div>
              <div class="instruction">QRコードを読み取って注文</div>
            </div>
          `).join('')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const downloadSVG = (table: string) => {
    const svgElement = document.querySelector(`[data-table="${table}"] svg`);
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${store?.slug}-${table}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '60px',
          textAlign: 'center',
          color: '#6a6a6a',
          fontFamily: "'Zen Kaku Gothic New', sans-serif",
        }}
      >
        読み込み中...
      </div>
    );
  }

  if (!store) {
    return (
      <div
        style={{
          padding: '60px',
          textAlign: 'center',
          color: '#e63946',
          fontFamily: "'Zen Kaku Gothic New', sans-serif",
        }}
      >
        店舗情報が見つかりません
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
              color: '#f5f0e6',
              fontFamily: "'Shippori Mincho', serif",
            }}
          >
            QRコード生成
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6a6a6a' }}>
            テーブルごとのQRコードを生成・印刷できます
          </p>
        </div>
        <button
          onClick={handlePrint}
          style={{
            padding: '12px 24px',
            border: 'none',
            background: 'linear-gradient(135deg, #d4af37, #c9a227)',
            color: '#0a0a0c',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          全て印刷
        </button>
      </div>

      {/* テーブル追加 */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          padding: '20px',
          background: '#1c1c26',
          border: '1px solid #2a2a36',
        }}
      >
        <input
          type="text"
          value={newTable}
          onChange={(e) => setNewTable(e.target.value.toUpperCase())}
          placeholder="テーブル名 (例: B1)"
          maxLength={10}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '1px solid #3a3a4a',
            background: '#0a0a0c',
            color: '#f5f0e6',
            fontSize: '14px',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
          onKeyDown={(e) => e.key === 'Enter' && addTable()}
        />
        <button
          onClick={addTable}
          style={{
            padding: '12px 24px',
            border: '1px solid #d4af37',
            background: 'transparent',
            color: '#d4af37',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          追加
        </button>
      </div>

      {/* QRコード一覧 */}
      <div
        ref={printRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {tables.map((table) => (
          <div
            key={table}
            style={{
              background: '#1c1c26',
              border: '1px solid #2a2a36',
              padding: '24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#6a6a6a',
                marginBottom: '4px',
                letterSpacing: '0.1em',
              }}
            >
              {store.name}
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#d4af37',
                marginBottom: '16px',
                fontFamily: "'Shippori Mincho', serif",
              }}
            >
              {table}
            </div>
            <div
              data-table={table}
              style={{
                background: '#fff',
                padding: '16px',
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              <QRCodeSVG
                value={getQRUrl(table)}
                size={160}
                level="M"
                includeMargin={false}
              />
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#6a6a6a',
                marginBottom: '16px',
                wordBreak: 'break-all',
              }}
            >
              {getQRUrl(table)}
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => downloadSVG(table)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #3a3a4a',
                  background: 'transparent',
                  color: '#9a9a9a',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                }}
              >
                SVG
              </button>
              <button
                onClick={() => removeTable(table)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #3a3a4a',
                  background: 'transparent',
                  color: '#e63946',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: "'Zen Kaku Gothic New', sans-serif",
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>

      {tables.length === 0 && (
        <div
          style={{
            padding: '60px',
            textAlign: 'center',
            color: '#6a6a6a',
            background: '#1c1c26',
            border: '1px solid #2a2a36',
          }}
        >
          テーブルを追加してください
        </div>
      )}
    </div>
  );
}
