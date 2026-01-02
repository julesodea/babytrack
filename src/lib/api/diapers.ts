import { supabase } from '../supabase';
import type { DiaperInsert, DiaperUpdate } from '../../types/database';

export async function getDiapers(userId: string) {
  const { data, error } = await supabase
    .from('diapers')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) throw error;
  return data;
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
