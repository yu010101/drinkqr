'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/auth-client';

interface PrintJob {
  id: string;
  order_id: string;
  printable_text: string;
  status: 'queued' | 'printed' | 'failed' | 'dead';
  attempts: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export default function PrintJobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreId = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: store } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (store) {
          setStoreId(store.id);
        }
      }
    };

    fetchStoreId();
  }, []);

  const fetchJobs = async () => {
    if (!storeId) return;

    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from('print_jobs')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching print jobs:', error);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (storeId) {
      fetchJobs();

      const supabase = createSupabaseBrowserClient();
      const channel = supabase
        .channel('print_jobs_realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'print_jobs',
            filter: `store_id=eq.${storeId}`
          },
          () => {
            fetchJobs();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [storeId, statusFilter]);

  const handleRetry = async (jobId: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('print_jobs')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (error) {
      alert('リトライに失敗しました');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'queued':
        return { bg: 'rgba(212, 175, 55, 0.15)', border: '#d4af37', text: '#d4af37' };
      case 'printed':
        return { bg: 'rgba(76, 175, 80, 0.15)', border: '#4caf50', text: '#4caf50' };
      case 'failed':
        return { bg: 'rgba(230, 57, 70, 0.15)', border: '#e63946', text: '#e63946' };
      case 'dead':
        return { bg: 'rgba(106, 106, 106, 0.15)', border: '#6a6a6a', text: '#6a6a6a' };
      default:
        return { bg: '#2a2a36', border: '#3a3a4a', text: '#9a9a9a' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'queued': return '待機中';
      case 'printed': return '印刷完了';
      case 'failed': return '失敗';
      case 'dead': return '停止';
      default: return status;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const stats = {
    queued: jobs.filter((j) => j.status === 'queued').length,
    printed: jobs.filter((j) => j.status === 'printed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
    dead: jobs.filter((j) => j.status === 'dead').length,
  };

  const statItems = [
    { key: 'queued', label: '待機中', color: '#d4af37' },
    { key: 'printed', label: '印刷完了', color: '#4caf50' },
    { key: 'failed', label: '失敗', color: '#e63946' },
    { key: 'dead', label: '停止', color: '#6a6a6a' },
  ];

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
            印刷状況
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#6a6a6a' }}>
            リアルタイムで印刷ジョブを監視
          </p>
        </div>
        <button
          onClick={fetchJobs}
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
          更新
        </button>
      </div>

      {/* 統計 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {statItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(statusFilter === item.key ? 'all' : item.key)}
            style={{
              background: statusFilter === item.key ? `${item.color}20` : '#1c1c26',
              border: `1px solid ${statusFilter === item.key ? item.color : '#2a2a36'}`,
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: statusFilter === item.key ? item.color : '#6a6a6a',
                marginBottom: '8px',
                letterSpacing: '0.05em',
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: statusFilter === item.key ? item.color : '#f5f0e6',
                fontFamily: "'Shippori Mincho', serif",
              }}
            >
              {stats[item.key as keyof typeof stats]}
            </div>
          </button>
        ))}
      </div>

      {/* ジョブリスト */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            color: '#6a6a6a',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          読み込み中...
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            background: '#1c1c26',
            border: '1px solid #2a2a36',
            color: '#6a6a6a',
            fontFamily: "'Zen Kaku Gothic New', sans-serif",
          }}
        >
          印刷ジョブがありません
        </div>
      ) : (
        <div
          style={{
            background: '#1c1c26',
            border: '1px solid #2a2a36',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a36' }}>
                {['ステータス', 'ジョブID', '試行', '作成日時', 'エラー', '操作'].map((header, i) => (
                  <th
                    key={header}
                    style={{
                      padding: '16px 20px',
                      textAlign: i === 5 ? 'right' : 'left',
                      fontSize: '11px',
                      color: '#6a6a6a',
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      fontFamily: "'Zen Kaku Gothic New', sans-serif",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => {
                const statusStyle = getStatusStyle(job.status);
                return (
                  <tr
                    key={job.id}
                    style={{
                      borderBottom: index < jobs.length - 1 ? '1px solid #2a2a36' : 'none',
                    }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: statusStyle.bg,
                          border: `1px solid ${statusStyle.border}`,
                          color: statusStyle.text,
                        }}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        color: '#9a9a9a',
                      }}
                    >
                      #{job.id.slice(-6).toUpperCase()}
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        fontSize: '14px',
                        color: '#f5f0e6',
                      }}
                    >
                      {job.attempts}
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        fontSize: '13px',
                        color: '#6a6a6a',
                      }}
                    >
                      {formatTime(job.created_at)}
                    </td>
                    <td
                      style={{
                        padding: '16px 20px',
                        fontSize: '12px',
                        color: '#e63946',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {job.last_error || '-'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {(job.status === 'failed' || job.status === 'dead') && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid #d4af37',
                            background: 'transparent',
                            color: '#d4af37',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontFamily: "'Zen Kaku Gothic New', sans-serif",
                          }}
                        >
                          リトライ
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
