-- Lead management for admin portal
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  matched_profile_id uuid references public.profiles(id) on delete set null,
  converted_profile_id uuid references public.profiles(id) on delete set null,
  converted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select" on public.leads
  for select using (public.current_user_role() = 'admin');

drop policy if exists "leads_admin_insert" on public.leads;
create policy "leads_admin_insert" on public.leads
  for insert with check (public.current_user_role() = 'admin');

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "leads_admin_delete" on public.leads;
create policy "leads_admin_delete" on public.leads
  for delete using (public.current_user_role() = 'admin');

drop trigger if exists leads_updated_at on public.leads;
create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.update_updated_at();
