import { supabase } from '../supabase';
import type { Diaper, DiaperInsert, DiaperUpdate } from '../../types/database';

/**
 * Get all diapers for a specific baby
 * RLS policies automatically enforce access control
 */
export async function getDiapers(babyId: string): Promise<Diaper[]> {
  const { data, error } = await supabase
    .from('diapers')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all diapers across all accessible babies
 */
export async function getAllDiapers(): Promise<Diaper[]> {
  const { data, error } = await supabase
    .from('diapers')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDiaper(id: string) {
  const { data, error } = await supabase
    .from('diapers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createDiaper(diaper: DiaperInsert) {
  const { data, error } = await supabase
    .from('diapers')
    .insert(diaper)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDiaper(id: string, diaper: DiaperUpdate) {
  const { data, error } = await supabase
    .from('diapers')
    .update({ ...diaper, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDiaper(id: string) {
  const { error } = await supabase
    .from('diapers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteDiapers(ids: string[]) {
  const { error } = await supabase
    .from('diapers')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
