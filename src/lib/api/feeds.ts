import { supabase } from '../supabase';
import type { Feed, FeedInsert, FeedUpdate } from '../../types/database';

/**
 * Get all feeds for a specific baby
 * RLS policies automatically enforce access control
 */
export async function getFeeds(babyId: string): Promise<Feed[]> {
  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .eq('baby_id', babyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get all feeds across all accessible babies
 * Useful for dashboard view showing all activities
 */
export async function getAllFeeds(): Promise<Feed[]> {
  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFeed(id: string) {
  const { data, error } = await supabase
    .from('feeds')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createFeed(feed: FeedInsert) {
  const { data, error } = await supabase
    .from('feeds')
    .insert(feed)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFeed(id: string, feed: FeedUpdate) {
  const { data, error } = await supabase
    .from('feeds')
    .update({ ...feed, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFeed(id: string) {
  const { error } = await supabase
    .from('feeds')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteFeeds(ids: string[]) {
  const { error } = await supabase
    .from('feeds')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
