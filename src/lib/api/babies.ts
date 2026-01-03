import { supabase } from '../supabase';
import type { Baby } from '../../types/database';

/**
 * Get all babies the current user has access to (owned or shared)
 */
export async function getAccessibleBabies(_userId: string): Promise<Baby[]> {
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single baby by ID (RLS enforces access control)
 */
export async function getBaby(babyId: string): Promise<Baby | null> {
  const { data, error } = await supabase
    .from('babies')
    .select('*')
    .eq('id', babyId)
    .single();

  if (error) {
    console.error('Error fetching baby:', error);
    return null;
  }
  return data;
}

/**
 * Create a new baby and automatically create an owner share
 */
export async function createBaby(
  userId: string,
  name: string,
  birthDate?: string
): Promise<Baby> {
  const { data, error } = await supabase
    .from('babies')
    .insert({
      user_id: userId,
      name,
      birth_date: birthDate || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Automatically create a baby_share for the owner
  const { error: shareError } = await supabase.from('baby_shares').insert({
    baby_id: data.id,
    user_id: userId,
    role: 'owner',
    status: 'active',
  });

  if (shareError) {
    console.error('Error creating owner share:', shareError);
    // Don't throw - the baby was created successfully
  }

  return data;
}

/**
 * Update baby details (only owner can do this via RLS)
 */
export async function updateBaby(
  babyId: string,
  updates: {
    name?: string;
    birth_date?: string | null;
    avatar_url?: string | null;
  }
) {
  const { data, error } = await supabase
    .from('babies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', babyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a baby (cascade deletes shares and activities via DB constraints)
 * Only the owner can do this via RLS
 */
export async function deleteBaby(babyId: string) {
  const { error } = await supabase.from('babies').delete().eq('id', babyId);

  if (error) throw error;
}
