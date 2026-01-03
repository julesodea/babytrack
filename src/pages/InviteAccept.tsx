import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import { getPendingInvites, acceptInvite } from '../lib/api/babyShares';

export function InviteAccept() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { refreshBabies, setSelectedBaby, babies } = useBaby();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not_found'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    handleInviteAcceptance();
  }, [user, profile]);

  const handleInviteAcceptance = async () => {
    if (!user || !profile?.email) {
      setStatus('loading');
      return;
    }

    const babyId = searchParams.get('baby_id');

    if (!babyId) {
      setStatus('error');
      setMessage('Invalid invitation link');
      return;
    }

    try {
      // Find pending invite for this user's email and baby
      const pendingInvites = await getPendingInvites(profile.email);
      const invite = pendingInvites.find((inv: any) => inv.baby_id === babyId);

      if (!invite) {
        setStatus('not_found');
        setMessage('No pending invitation found for this baby');
        return;
      }

      // Accept the invitation
      await acceptInvite(invite.id, user.id);
      await refreshBabies();

      // Select the newly accessible baby
      const baby = babies.find((b) => b.id === babyId);
      if (baby) {
        setSelectedBaby(baby);
      }

      setStatus('success');
      setMessage('Invitation accepted successfully!');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      setStatus('error');
      setMessage('Failed to accept invitation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Processing Invitation
            </h2>
            <p className="text-gray-600">Please wait...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Success!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Error
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'not_found' && (
          <>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Invitation Not Found
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              The invitation may have already been accepted or declined.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
