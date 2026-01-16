-- orders テーブルの作成
create table orders (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  items jsonb not null,
  created_at timestamptz default now()
);

-- print_jobs テーブルの作成
create table print_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  printable_text text not null,
  status text not null default 'queued',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- インデックスの作成
create index idx_print_jobs_status on print_jobs(status);

-- Realtimeの有効化（print_jobsテーブル）
alter publication supabase_realtime add table print_jobs;
