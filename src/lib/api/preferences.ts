import { supabase } from '../supabase';
import type { PreferencesInsert, PreferencesUpdate } from '../../types/database';

export async function getPreferences(userId: string) {
  const { data, error } = await supabase
    .from('preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function upsertPreferences(preferences: PreferencesInsert) {
  const { data, error } = await supabase
    .from('preferences')
    .upsert(preferences, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePreferences(userId: string, preferences: PreferencesUpdate) {
  const { data, error } = await supabase
    .from('preferences')
    .update({ ...preferences, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
