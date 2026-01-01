import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { createFamily, joinFamily } from '../lib/api/families';

export function FamilySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!familyName.trim() || !user) return;
    setLoading(true);
    setError('');

    try {
      await createFamily(familyName, user.id);
      navigate('/');
    } catch (err) {
      setError('Failed to create family');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !user) return;
    setLoading(true);
    setError('');

    try {
      await joinFamily(inviteCode, user.id);
      navigate('/');
    } catch (err) {
      setError('Invalid invite code');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center">Set Up Your Family</h2>
          <p className="text-gray-600 text-center">
            Create a new family or join an existing one to share baby tracking data.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 cursor-pointer"
            >
              Create New Family
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              Join Existing Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold">Create Family</h2>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="Family name (e.g., Smith Family)"
            className="w-full px-4 py-3 border rounded-xl"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-4">
            <button
              onClick={() => setMode('choose')}
              className="flex-1 py-3 border rounded-xl cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || !familyName.trim()}
              className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold">Join Family</h2>
        <p className="text-gray-600">
          Enter the 6-character invite code from your family member.
        </p>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="XXXXXX"
          maxLength={6}
          className="w-full px-4 py-3 border rounded-xl text-center text-2xl tracking-widest font-mono"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-4">
          <button
            onClick={() => setMode('choose')}
            className="flex-1 py-3 border rounded-xl cursor-pointer"
          >
            Back
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || inviteCode.length !== 6}
            className="flex-1 py-3 bg-gray-900 text-white rounded-xl disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
