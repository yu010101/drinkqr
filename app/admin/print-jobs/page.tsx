'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PrintJobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchJobs = async () => {
    setLoading(true);

    let query = supabase
      .from('print_jobs')
      .select('*')
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
    fetchJobs();

    // リアルタイム購読
    const channel = supabase
      .channel('print_jobs_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'print_jobs' },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [statusFilter]);

  // リトライ
  const handleRetry = async (jobId: string) => {
    const { error } = await supabase
      .from('print_jobs')
      .update({ status: 'queued', updated_at: new Date().toISOString() })
      .eq('id', jobId);

    if (error) {
      alert('リトライに失敗しました');
    }
  };

  // ステータスの色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued':
        return { bg: '#fff3cd', text: '#856404' };
      case 'printed':
        return { bg: '#d4edda', text: '#155724' };
      case 'failed':
        return { bg: '#f8d7da', text: '#721c24' };
      case 'dead':
        return { bg: '#343a40', text: 'white' };
      default:
        return { bg: '#e9ecef', text: '#495057' };
    }
  };

  // ステータスのラベル
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'queued':
        return '待機中';
      case 'printed':
        return '印刷完了';
      case 'failed':
        return '失敗';
      case 'dead':
        return '停止';
      default:
        return status;
    }
  };

  // 時刻フォーマット
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

  // 統計
  const stats = {
    queued: jobs.filter((j) => j.status === 'queued').length,
    printed: jobs.filter((j) => j.status === 'printed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
    dead: jobs.filter((j) => j.status === 'dead').length,
  };

  return (
    <div style={{ padding: '30px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px' }}>印刷状況</h1>
        <button
          onClick={fetchJobs}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#28a745',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
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
          gap: '15px',
          marginBottom: '25px',
        }}
      >
        {[
          { key: 'queued', label: '待機中', color: '#ffc107' },
          { key: 'printed', label: '印刷完了', color: '#28a745' },
          { key: 'failed', label: '失敗', color: '#dc3545' },
          { key: 'dead', label: '停止', color: '#343a40' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() =>
              setStatusFilter(statusFilter === item.key ? 'all' : item.key)
            }
            style={{
              backgroundColor:
                statusFilter === item.key ? item.color : 'white',
              color: statusFilter === item.key ? 'white' : '#333',
              padding: '20px',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div
              style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px' }}
            >
              {item.label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>
              {stats[item.key as keyof typeof stats]}
            </div>
          </button>
        ))}
      </div>

      {/* ジョブリスト */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          読み込み中...
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: 'white',
            borderRadius: '8px',
            color: '#666',
          }}
        >
          印刷ジョブがありません
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th
                  style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '600',
                  }}
                >
                  ステータス
                </th>
                <th
                  style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '600',
                  }}
                >
                  ジョブID
                </th>
                <th
                  style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '600',
                  }}
                >
                  試行回数
                </th>
                <th
                  style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '600',
                  }}
                >
                  作成日時
                </th>
                <th
                  style={{
                    padding: '12px 15px',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '600',
                  }}
                >
                  エラー
                </th>
                <th
                  style={{
                    padding: '12px 15px',
                    textAlign: 'right',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '600',
                  }}
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const statusColor = getStatusColor(job.status);
                return (
                  <tr
                    key={job.id}
                    style={{ borderTop: '1px solid #eee' }}
                  >
                    <td style={{ padding: '12px 15px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                        }}
                      >
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '12px 15px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                      }}
                    >
                      #{job.id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px 15px', fontSize: '14px' }}>
                      {job.attempts}
                    </td>
                    <td
                      style={{
                        padding: '12px 15px',
                        fontSize: '13px',
                        color: '#666',
                      }}
                    >
                      {formatTime(job.created_at)}
                    </td>
                    <td
                      style={{
                        padding: '12px 15px',
                        fontSize: '12px',
                        color: '#dc3545',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {job.last_error || '-'}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                      {(job.status === 'failed' || job.status === 'dead') && (
                        <button
                          onClick={() => handleRetry(job.id)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '12px',
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
