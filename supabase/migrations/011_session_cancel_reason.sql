alter table public.sessions
add column if not exists cancel_reason text;
