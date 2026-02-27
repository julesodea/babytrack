import { supabase } from '../supabase';
import type { Weight, WeightInsert, WeightUpdate } from '../../types/database';

export async function getWeights(babyId: string): Promise<Weight[]> {
  const { data, error } = await supabase
    .from('weights')
    .select('*')
    .eq('baby_id', babyId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getWeight(id: string): Promise<Weight> {
  const { data, error } = await supabase
    .from('weights')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createWeight(weight: WeightInsert) {
  const { data, error } = await supabase
    .from('weights')
    .insert(weight)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWeight(id: string, weight: WeightUpdate) {
  const { data, error } = await supabase
    .from('weights')
    .update({ ...weight, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWeight(id: string) {
  const { error } = await supabase
    .from('weights')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteWeights(ids: string[]) {
  const { error } = await supabase
    .from('weights')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
