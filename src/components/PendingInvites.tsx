import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPendingInvites,
  acceptInvite,
  declineInvite,
} from '../lib/api/babyShares';
import { useBaby } from '../contexts/BabyContext';

interface PendingInvite {
  id: string;
  baby_id: string;
  invited_email: string;
  babies?: {
    name: string;
  };
}

export function PendingInvites() {
  const { user, profile } = useAuth();
  const { refreshBabies } = useBaby();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadInvites();
  }, [user, profile]);

  const loadInvites = async () => {
    if (!profile?.email) {
      setLoading(false);
      return;
    }

    try {
      const pending = await getPendingInvites(profile.email);
      setInvites(pending);
    } catch (error) {
      console.error('Failed to load invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (inviteId: string) => {
    if (!user) return;

    setProcessing(inviteId);
    try {
      await acceptInvite(inviteId, user.id);
      await refreshBabies();
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (error) {
      console.error('Failed to accept invite:', error);
      alert('Failed to accept invitation. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessing(inviteId);
    try {
      await declineInvite(inviteId);
      setInvites(invites.filter((inv) => inv.id !== inviteId));
    } catch (error) {
      console.error('Failed to decline invite:', error);
      alert('Failed to decline invitation. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  if (loading || invites.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">
        Pending Invitations ({invites.length})
      </h3>
      <div className="space-y-2">
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="flex items-center justify-between bg-white p-3 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {invite.babies?.name || 'Unknown Baby'}
              </p>
              <p className="text-xs text-gray-500">
                You've been invited to track this baby
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(invite.id)}
                disabled={processing === invite.id}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing === invite.id ? 'Accepting...' : 'Accept'}
              </button>
              <button
                onClick={() => handleDecline(invite.id)}
                disabled={processing === invite.id}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
