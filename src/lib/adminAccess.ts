import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL_DOMAIN = '@unipilot.app';

export type AdminAccessFailureReason =
  | 'unauthenticated'
  | 'invalid_domain'
  | 'missing_profile'
  | 'profile_check_failed';

export interface AdminAccessResult {
  allowed: boolean;
  reason?: AdminAccessFailureReason;
}

export function isUniPilotAdminEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN) ?? false;
}

export async function verifyAdminAccess(user: User | null): Promise<AdminAccessResult> {
  if (!user) {
    return { allowed: false, reason: 'unauthenticated' };
  }

  const email = user.email?.trim().toLowerCase();

  if (!isUniPilotAdminEmail(email)) {
    return { allowed: false, reason: 'invalid_domain' };
  }

  const { data: profileById, error: profileByIdError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileByIdError) {
    return { allowed: false, reason: 'profile_check_failed' };
  }

  if (profileById) {
    return { allowed: true };
  }

  const { data: profileByEmail, error: profileByEmailError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (profileByEmailError) {
    return { allowed: false, reason: 'profile_check_failed' };
  }

  return profileByEmail
    ? { allowed: true }
    : { allowed: false, reason: 'missing_profile' };
}

export function getAdminAccessErrorMessage(reason?: AdminAccessFailureReason) {
  switch (reason) {
    case 'invalid_domain':
      return 'Only @unipilot.app email addresses can access the admin dashboard.';
    case 'missing_profile':
      return 'Your account is not registered in the UniPilot user database.';
    case 'profile_check_failed':
      return 'Unable to verify your admin access. Please try again.';
    case 'unauthenticated':
    default:
      return 'Please sign in to access the admin dashboard.';
  }
}
