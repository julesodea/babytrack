import { supabase } from '../supabase';

export function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createFamily(name: string, userId: string) {
  const inviteCode = generateInviteCode();

  const { data: family, error } = await supabase
    .from('families')
    .insert({
      name,
      invite_code: inviteCode,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;

  // Link creator to family as owner
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ family_id: family.id, role: 'owner' })
    .eq('id', userId);

  if (updateError) throw updateError;

  return family;
}

export async function joinFamily(inviteCode: string, userId: string) {
  // Find family by invite code
  const { data: family, error: findError } = await supabase
    .from('families')
    .select()
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (findError || !family) {
    throw new Error('Invalid invite code');
  }

  // Link user to family as member
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ family_id: family.id, role: 'member' })
    .eq('id', userId);

  if (updateError) throw updateError;

  return family;
}

export async function getFamily(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('family_id')
    .eq('id', userId)
    .single();

  if (!profile?.family_id) return null;

  const { data: family, error } = await supabase
    .from('families')
    .select(`
      *,
      members:profiles(id, email, full_name, avatar_url, role)
    `)
    .eq('id', profile.family_id)
    .single();

  if (error) throw error;
  return family;
}

export async function regenerateInviteCode(familyId: string) {
  const newCode = generateInviteCode();

  const { data, error } = await supabase
    .from('families')
    .update({ invite_code: newCode })
    .eq('id', familyId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
