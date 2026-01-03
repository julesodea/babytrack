import { supabase } from '../supabase';
import type { BabyShare } from '../../types/database';

/**
 * Get all shares for a specific baby
 */
export async function getBabyShares(babyId: string): Promise<BabyShare[]> {
  const { data, error } = await supabase
    .from('baby_shares')
    .select('*')
    .eq('baby_id', babyId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get pending invitations for the current user's email
 */
export async function getPendingInvites(userEmail: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('baby_shares')
    .select('*, babies(*)')
    .eq('invited_email', userEmail)
    .eq('status', 'pending');

  if (error) throw error;
  return data || [];
}

/**
 * Invite a user by email to access a baby
 */
export async function inviteUser(
  babyId: string,
  email: string,
  invitedBy: string
): Promise<BabyShare> {
  // Check if user with this email already exists
  // Use maybeSingle() instead of single() to handle the case where user doesn't exist
  const { data: existingUser, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  // Ignore profile lookup errors - user might not exist yet
  if (profileError) {
    console.log('Profile lookup failed (user may not exist yet):', profileError);
  }

  const insertData = {
    baby_id: babyId,
    user_id: existingUser?.id || null,
    invited_email: email,
    invited_by: invitedBy,
    role: 'caregiver',
    status: 'pending',
  };

  console.log('Attempting to insert baby_share:', insertData);
  console.log('Current user (auth.uid()):', invitedBy);

  const { data, error } = await supabase
    .from('baby_shares')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Insert failed with error:', error);
    throw error;
  }

  // TODO: Send email notification via Supabase Auth or email service
  // await sendInvitationEmail(email, babyId);

  return data;
}

/**
 * Accept an invitation
 */
export async function acceptInvite(
  shareId: string,
  userId: string
): Promise<BabyShare> {
  const { data, error } = await supabase
    .from('baby_shares')
    .update({
      user_id: userId,
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', shareId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Decline an invitation
 */
export async function declineInvite(shareId: string) {
  const { error } = await supabase
    .from('baby_shares')
    .update({
      status: 'declined',
      updated_at: new Date().toISOString(),
    })
    .eq('id', shareId);

  if (error) throw error;
}

/**
 * Remove a share (user leaves baby or owner revokes access)
 */
export async function removeShare(shareId: string) {
  const { error } = await supabase
    .from('baby_shares')
    .delete()
    .eq('id', shareId);

  if (error) throw error;
}

/**
 * Get all users who have access to a baby (with profile info)
 */
export async function getBabyUsers(babyId: string) {
  // First get all baby_shares
  const { data: shares, error: sharesError } = await supabase
    .from('baby_shares')
    .select('*')
    .eq('baby_id', babyId)
    .eq('status', 'active');

  if (sharesError) throw sharesError;
  if (!shares) return [];

  // Then get profiles for users that have user_id (skip null user_ids)
  const userIds = shares.filter(s => s.user_id).map(s => s.user_id);

  if (userIds.length === 0) return shares;

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  // Manually join profiles to shares
  const sharesWithProfiles = shares.map(share => ({
    ...share,
    profiles: share.user_id ? profiles?.find(p => p.id === share.user_id) : null
  }));

  return sharesWithProfiles;
}
