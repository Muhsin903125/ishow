import { createClient } from '@/lib/supabase/client';

export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  result_label: string | null;
  quote: string;
  rating: number;
  is_published: boolean;
  created_at: string;
}

export async function listTestimonials() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Testimonial[];
}

export async function createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at'>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .insert([testimonial])
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Testimonial;
}

export async function deleteTestimonial(id: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
