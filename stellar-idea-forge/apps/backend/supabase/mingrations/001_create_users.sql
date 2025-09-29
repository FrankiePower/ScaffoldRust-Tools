create table users (
  id uuid primary key default gen_random_uuid(),
  public_key text unique not null,
  address text not null,
  last_login timestamptz default now(),
  session_count int default 0,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);
