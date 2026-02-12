import { supabase } from '../supabase';
import type { Medicine, MedicineInsert, MedicineUpdate } from '../../types/database';

/**
 * Get all medicines for a specific baby
 * RLS policies automatically enforce access control
 */
export async function getMedicines(babyId: string): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all medicines across all accessible babies
 * Useful for dashboard view showing all activities
 */
export async function getAllMedicines(): Promise<Medicine[]> {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMedicine(id: string) {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createMedicine(medicine: MedicineInsert) {
  const { data, error } = await supabase
    .from('medicines')
    .insert(medicine)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMedicine(id: string, medicine: MedicineUpdate) {
  const { data, error } = await supabase
    .from('medicines')
    .update({ ...medicine, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMedicine(id: string) {
  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteMedicines(ids: string[]) {
  const { error } = await supabase
    .from('medicines')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
