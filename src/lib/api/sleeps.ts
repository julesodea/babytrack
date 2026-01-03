import { supabase } from '../supabase';
import type { Sleep, SleepInsert, SleepUpdate } from '../../types/database';

/**
 * Get all sleeps for a specific baby
 * RLS policies automatically enforce access control
 */
export async function getSleeps(babyId: string): Promise<Sleep[]> {
  const { data, error } = await supabase
    .from('sleeps')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all sleeps across all accessible babies
 */
export async function getAllSleeps(): Promise<Sleep[]> {
  const { data, error } = await supabase
    .from('sleeps')
    .select('*')
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSleep(id: string) {
  const { data, error } = await supabase
    .from('sleeps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSleep(sleep: SleepInsert) {
  const { data, error } = await supabase
    .from('sleeps')
    .insert(sleep)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSleep(id: string, sleep: SleepUpdate) {
  const { data, error } = await supabase
    .from('sleeps')
    .update({ ...sleep, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSleep(id: string) {
  const { error } = await supabase
    .from('sleeps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteSleeps(ids: string[]) {
  const { error } = await supabase
    .from('sleeps')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
