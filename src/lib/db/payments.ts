import { createClient } from '@/lib/supabase/client';
import { createNotification } from './notifications';

export interface Payment {
  id: string;
  userId: string;
  planId?: string;
  amount: number;
  paidDate?: string;
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  reference?: string;
  description?: string;
  createdAt: string;
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    planId: (row.plan_id as string) ?? undefined,
    amount: row.amount as number,
    paidDate: (row.paid_date as string) ?? undefined,
    dueDate: (row.due_date as string) ?? undefined,
    status: row.status as Payment['status'],
    reference: (row.reference as string) ?? undefined,
    description: (row.description as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

export async function listPayments(filters?: { userId?: string }): Promise<Payment[]> {
  const supabase = createClient();
  let query = supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });
  if (filters?.userId) query = query.eq('user_id', filters.userId);
  const { data, error } = await query;
  if (error || !data) return [];
  const today = new Date().toISOString().split("T")[0];
  return data.map(row => {
    const payment = mapPayment(row);
    if (payment.status === "pending" && payment.dueDate && payment.dueDate < today) {
      payment.status = "overdue";
    }
    return payment;
  });
}

export async function createPayment(
  payload: Omit<Payment, 'id' | 'createdAt'>
): Promise<Payment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: payload.userId,
      plan_id: payload.planId ?? null,
      amount: payload.amount,
      paid_date: payload.paidDate ?? null,
      due_date: payload.dueDate ?? null,
      status: payload.status,
      reference: payload.reference ?? null,
      description: payload.description ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;

  // RT2: Notification
  await createNotification({
    userId: payload.userId,
    type: 'payment_due',
    title: 'New Payment Due',
    body: `AED ${payload.amount} is due on ${new Date((payload.dueDate || "") + "T00:00:00").toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`,
    href: '/payments',
  });

  return mapPayment(data);
}

export async function updatePaymentStatus(
  paymentId: string,
  status: Payment['status'],
  paidDate?: string
): Promise<Payment | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .update({ status, paid_date: paidDate ?? null })
    .eq('id', paymentId)
    .select()
    .single();
  if (error || !data) return null;
  return mapPayment(data);
}

export async function deletePayment(paymentId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from('payments').delete().eq('id', paymentId);
  return !error;
}
