alter table public.payments
add column if not exists paid_amount numeric(10, 2) not null default 0;

update public.payments
set paid_amount = case
  when status = 'paid' then amount
  else 0
end
where paid_amount = 0;

alter table public.payments
drop constraint if exists payments_paid_amount_nonnegative;

alter table public.payments
add constraint payments_paid_amount_nonnegative
check (paid_amount >= 0 and paid_amount <= amount);
