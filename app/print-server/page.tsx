'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Supabase設定
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

// ESC/POSコマンド
const ESC = 0x1b;
const GS = 0x1d;
const COMMANDS = {
  INIT: [ESC, 0x40], // プリンター初期化
  CUT: [GS, 0x56, 0x00], // 用紙カット
  FEED: [ESC, 0x64, 0x03], // 3行送り
  ALIGN_CENTER: [ESC, 0x61, 0x01],
  ALIGN_LEFT: [ESC, 0x61, 0x00],
  BOLD_ON: [ESC, 0x45, 0x01],
  BOLD_OFF: [ESC, 0x45, 0x00],
  DOUBLE_SIZE: [GS, 0x21, 0x11], // 縦横2倍
  NORMAL_SIZE: [GS, 0x21, 0x00],
};

interface PrintJob {
  id: string;
  order_id: string;
  printable_text: string;
  status: string;
  created_at: string;
}

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
  time: string;
}

export default function PrintServerPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [printerName, setPrinterName] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<string>('接続中...');
  const [printCount, setPrintCount] = useState(0);
  const [lastPrint, setLastPrint] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSupported, setIsSupported] = useState(true);

  const deviceRef = useRef<BluetoothDevice | null>(null);
  const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // ログ追加
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('ja-JP');
    const id = `${Date.now()}-${Math.random()}`;
    setLogs((prev) => [{ id, message, type, time }, ...prev.slice(0, 49)]);
  }, []);

  // Web Bluetooth APIサポートチェック
  useEffect(() => {
    if (!navigator.bluetooth) {
      setIsSupported(false);
      addLog('このブラウザはWeb Bluetooth APIをサポートしていません', 'error');
    }
  }, [addLog]);

  // Supabase接続
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      addLog('Supabase設定が見つかりません', 'error');
      return;
    }

    supabaseRef.current = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 起動時に未処理ジョブを処理
    processQueuedJobs();

    // Realtime購読
    channelRef.current = supabaseRef.current
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
          addLog(`新規注文: #${(payload.new as PrintJob).id.slice(-6).toUpperCase()}`, 'info');
          await printOrder(payload.new as PrintJob);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSupabaseStatus('接続済み');
          addLog('サーバーに接続しました', 'success');
        } else {
          setSupabaseStatus(status);
        }
      });

    return () => {
      channelRef.current?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 未処理ジョブを処理
  const processQueuedJobs = async () => {
    if (!supabaseRef.current) return;

    const { data: jobs, error } = await supabaseRef.current
      .from('print_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true });

    if (error) {
      addLog(`ジョブ取得エラー: ${error.message}`, 'error');
      return;
    }

    if (jobs && jobs.length > 0) {
      addLog(`未処理ジョブ ${jobs.length}件を処理します`, 'info');
      for (const job of jobs) {
        await printOrder(job);
      }
    }
  };

  // Bluetoothプリンター接続
  const connectPrinter = async () => {
    try {
      addLog('プリンターを検索中...', 'info');

      // Bluetoothデバイスを検索
      const device = await navigator.bluetooth.requestDevice({
        // SII MP-B20用のフィルター（一般的なESC/POSプリンター）
        filters: [
          { namePrefix: 'MP-B20' },
          { namePrefix: 'SII' },
          { namePrefix: 'Seiko' },
        ],
        optionalServices: [
          // Nordic UART Service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          // 一般的なSerial Port Service
          '000018f0-0000-1000-8000-00805f9b34fb',
          // SII独自サービス（推測）
          '0000ff00-0000-1000-8000-00805f9b34fb',
        ],
      });

      deviceRef.current = device;
      setPrinterName(device.name || 'Unknown Printer');
      addLog(`デバイス検出: ${device.name}`, 'info');

      // GATT接続
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        setPrinterName(null);
        characteristicRef.current = null;
        addLog('プリンターとの接続が切断されました', 'error');
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error('GATT接続に失敗しました');

      // サービスを検索
      const services = await server.getPrimaryServices();
      addLog(`${services.length}個のサービスを検出`, 'info');

      // 書き込み可能なCharacteristicを探す
      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              characteristicRef.current = char;
              addLog(`書き込み用Characteristic発見: ${char.uuid}`, 'success');
              break;
            }
          }
          if (characteristicRef.current) break;
        } catch {
          continue;
        }
      }

      if (!characteristicRef.current) {
        throw new Error('書き込み可能なCharacteristicが見つかりません');
      }

      setIsConnected(true);
      addLog('プリンターに接続しました', 'success');

      // 未処理ジョブを再処理
      processQueuedJobs();

    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      addLog(`接続エラー: ${message}`, 'error');
      setIsConnected(false);
    }
  };

  // プリンター切断
  const disconnectPrinter = () => {
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    setIsConnected(false);
    setPrinterName(null);
    characteristicRef.current = null;
    addLog('プリンターを切断しました', 'info');
  };

  // テキストをESC/POSコマンドに変換
  const textToEscPos = (text: string): Uint8Array => {
    const encoder = new TextEncoder();
    const commands: number[] = [];

    // 初期化
    commands.push(...COMMANDS.INIT);

    // テキストを行ごとに処理
    const lines = text.split('\n');
    for (const line of lines) {
      // 中央揃えの行（【】で囲まれている）
      if (line.includes('【') && line.includes('】')) {
        commands.push(...COMMANDS.ALIGN_CENTER);
        commands.push(...COMMANDS.BOLD_ON);
      }
      // テーブル番号（大きく表示）
      else if (line.match(/^[A-Z]\d+$/)) {
        commands.push(...COMMANDS.ALIGN_CENTER);
        commands.push(...COMMANDS.DOUBLE_SIZE);
      }
      // 区切り線
      else if (line.includes('---')) {
        commands.push(...COMMANDS.ALIGN_LEFT);
        commands.push(...COMMANDS.NORMAL_SIZE);
      }
      // 通常行
      else {
        commands.push(...COMMANDS.ALIGN_LEFT);
        commands.push(...COMMANDS.NORMAL_SIZE);
        commands.push(...COMMANDS.BOLD_OFF);
      }

      // テキスト追加
      const encoded = encoder.encode(line + '\n');
      commands.push(...encoded);

      // サイズをリセット
      commands.push(...COMMANDS.NORMAL_SIZE);
      commands.push(...COMMANDS.BOLD_OFF);
    }

    // 紙送りとカット
    commands.push(...COMMANDS.FEED);
    commands.push(...COMMANDS.CUT);

    return new Uint8Array(commands);
  };

  // 印刷実行
  const printOrder = async (job: PrintJob) => {
    if (!characteristicRef.current || !isConnected) {
      addLog(`印刷スキップ（プリンター未接続）: #${job.id.slice(-6).toUpperCase()}`, 'error');
      return;
    }

    try {
      const data = textToEscPos(job.printable_text);

      // 20バイトずつ分割して送信（BLEの制限）
      const chunkSize = 20;
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        if (characteristicRef.current.properties.writeWithoutResponse) {
          await characteristicRef.current.writeValueWithoutResponse(chunk);
        } else {
          await characteristicRef.current.writeValue(chunk);
        }
        // 少し待機
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      // ステータス更新
      await updatePrintJobStatus(job.id, 'printed');

      setPrintCount((prev) => prev + 1);
      setLastPrint(new Date().toLocaleTimeString('ja-JP'));
      addLog(`印刷完了: #${job.id.slice(-6).toUpperCase()}`, 'success');

    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      addLog(`印刷エラー: #${job.id.slice(-6).toUpperCase()} - ${message}`, 'error');
      await updatePrintJobStatus(job.id, 'failed', message);
    }
  };

  // ステータス更新
  const updatePrintJobStatus = async (id: string, status: string, error?: string) => {
    if (!supabaseRef.current) return;

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (error) {
      updateData.last_error = error;
    }

    if (status === 'failed') {
      const { data: job } = await supabaseRef.current
        .from('print_jobs')
        .select('attempts')
        .eq('id', id)
        .single();

      const jobData = job as { attempts: number } | null;
      if (jobData) {
        updateData.attempts = jobData.attempts + 1;
        if (jobData.attempts >= 4) {
          updateData.status = 'dead';
        }
      }
    }

    await supabaseRef.current.from('print_jobs').update(updateData as never).eq('id', id);
  };

  // テスト印刷
  const testPrint = async () => {
    const testJob: PrintJob = {
      id: 'test-' + Date.now(),
      order_id: 'test',
      printable_text: `【注文票】

A1
--------------------------------
テスト印刷        x1
--------------------------------
${new Date().toLocaleTimeString('ja-JP')}
#TEST
`,
      status: 'queued',
      created_at: new Date().toISOString(),
    };

    await printOrder(testJob);
  };

  if (!isSupported) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>DrinkQR 印刷サーバー</h1>
          <p style={styles.subtitle}>Web Bluetooth版</p>
        </div>
        <div style={styles.errorBox}>
          <h2>ブラウザがサポートされていません</h2>
          <p>Web Bluetooth APIを使用するには、以下のブラウザを使用してください：</p>
          <ul>
            <li>Google Chrome（PC版）</li>
            <li>Microsoft Edge（PC版）</li>
            <li>Opera（PC版）</li>
          </ul>
          <p style={{ marginTop: '20px', color: '#666' }}>
            ※ Safari、Firefox、モバイルブラウザは非対応です
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ヘッダー */}
      <div style={styles.header}>
        <h1 style={styles.title}>DrinkQR 印刷サーバー</h1>
        <p style={styles.subtitle}>Web Bluetooth版 - ダウンロード不要</p>
      </div>

      {/* ステータス */}
      <div style={styles.statusCard}>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>サーバー接続</span>
          <span
            style={{
              ...styles.statusValue,
              color: supabaseStatus === '接続済み' ? '#4ade80' : '#f87171',
            }}
          >
            {supabaseStatus}
          </span>
        </div>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>プリンター</span>
          <span
            style={{
              ...styles.statusValue,
              color: isConnected ? '#4ade80' : '#f87171',
            }}
          >
            {isConnected ? printerName : '未接続'}
          </span>
        </div>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>本日の印刷数</span>
          <span style={styles.statusValue}>{printCount}</span>
        </div>
        <div style={styles.statusRow}>
          <span style={styles.statusLabel}>最終印刷</span>
          <span style={styles.statusValue}>{lastPrint || '-'}</span>
        </div>
      </div>

      {/* 接続ボタン */}
      <div style={styles.buttonGroup}>
        {!isConnected ? (
          <button onClick={connectPrinter} style={styles.connectButton}>
            Bluetoothプリンターに接続
          </button>
        ) : (
          <>
            <button onClick={disconnectPrinter} style={styles.disconnectButton}>
              切断
            </button>
            <button onClick={testPrint} style={styles.testButton}>
              テスト印刷
            </button>
          </>
        )}
      </div>

      {/* 使い方 */}
      {!isConnected && (
        <div style={styles.helpBox}>
          <h3 style={styles.helpTitle}>使い方</h3>
          <ol style={styles.helpList}>
            <li>SII MP-B20プリンターの電源を入れる</li>
            <li>プリンターのBluetoothをONにする</li>
            <li>「Bluetoothプリンターに接続」ボタンを押す</li>
            <li>表示されるリストから「MP-B20」を選択</li>
            <li>接続完了後、注文が来ると自動で印刷されます</li>
          </ol>
        </div>
      )}

      {/* ログ */}
      <div style={styles.logContainer}>
        <h3 style={styles.logTitle}>印刷ログ</h3>
        <div style={styles.logList}>
          {logs.length === 0 ? (
            <div style={styles.emptyLog}>注文を待っています...</div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  ...styles.logItem,
                  ...(log.type === 'success' ? styles.logSuccess : {}),
                  ...(log.type === 'error' ? styles.logError : {}),
                  ...(log.type === 'info' ? styles.logInfo : {}),
                }}
              >
                <span>{log.message}</span>
                <span style={styles.logTime}>{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* フッター */}
      <div style={styles.footer}>
        このページを開いたままにしてください（閉じると印刷されません）
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: '30px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    margin: '0 0 5px',
  },
  subtitle: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
  },
  statusCard: {
    backgroundColor: '#0f3460',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #1a1a3e',
  },
  statusLabel: {
    color: '#888',
    fontSize: '14px',
  },
  statusValue: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  connectButton: {
    flex: 1,
    padding: '15px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  disconnectButton: {
    flex: 1,
    padding: '15px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  testButton: {
    flex: 1,
    padding: '15px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  helpBox: {
    backgroundColor: '#0f3460',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  helpTitle: {
    fontSize: '16px',
    marginBottom: '15px',
    color: '#4ade80',
  },
  helpList: {
    margin: 0,
    paddingLeft: '20px',
    lineHeight: '2',
    color: '#ccc',
  },
  logContainer: {
    backgroundColor: '#0a0a1a',
    borderRadius: '12px',
    padding: '20px',
    maxHeight: '300px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  logTitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '15px',
  },
  logList: {
    flex: 1,
    overflowY: 'auto',
  },
  logItem: {
    padding: '8px 12px',
    marginBottom: '8px',
    borderRadius: '6px',
    fontSize: '13px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  logSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    borderLeft: '3px solid #4ade80',
  },
  logError: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderLeft: '3px solid #f87171',
  },
  logInfo: {
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    borderLeft: '3px solid #60a5fa',
  },
  logTime: {
    color: '#666',
    fontSize: '11px',
  },
  emptyLog: {
    color: '#555',
    textAlign: 'center',
    padding: '40px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#555',
    fontSize: '12px',
  },
  errorBox: {
    backgroundColor: '#2a1a1a',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
    border: '1px solid #dc3545',
  },
};
