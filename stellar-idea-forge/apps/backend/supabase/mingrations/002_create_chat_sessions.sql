create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  public_key text not null,
  session_type text check (session_type in ('solo', 'collaborative')) default 'solo',
  is_active boolean default true,
  room_id text,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);
