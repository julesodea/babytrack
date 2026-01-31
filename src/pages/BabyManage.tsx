import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import {
  updateBaby,
  deleteBaby,
} from '../lib/api/babies';
import {
  getBabyUsers,
  inviteUser,
  removeShare,
} from '../lib/api/babyShares';
import { useColorScheme } from '../context/ColorSchemeContext';
import { IconDashboard, IconUser } from '../components/icons';

interface BabyUser {
  id: string;
  role: 'owner' | 'caregiver';
  user_id: string | null;
  invited_email: string | null;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export function BabyManage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { babies, selectedBaby, refreshBabies, setSelectedBaby } = useBaby();
  const { colorScheme } = useColorScheme();

  const [editingBaby, setEditingBaby] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState<Record<string, BabyUser[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedUsers();
  }, [babies, user]);

  const loadSharedUsers = async () => {
    if (!user) return;

    const usersMap: Record<string, BabyUser[]> = {};
    for (const baby of babies) {
      try {
        const users = await getBabyUsers(baby.id);
        usersMap[baby.id] = users;
      } catch (err) {
        console.error(`Failed to load users for baby ${baby.id}:`, err);
      }
    }
    setSharedUsers(usersMap);
  };

  const handleEditBaby = (babyId: string, name: string, birthDate: string | null) => {
    setEditingBaby(babyId);
    setEditName(name);
    setEditBirthDate(birthDate || '');
  };

  const handleSaveEdit = async (babyId: string) => {
    if (!editName.trim()) {
      setError('Baby name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateBaby(babyId, {
        name: editName.trim(),
        birth_date: editBirthDate || null,
      });
      await refreshBabies();
      setEditingBaby(null);
    } catch (err) {
      console.error('Failed to update baby:', err);
      setError('Failed to update baby. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBaby = async (babyId: string, babyName: string) => {
    if (!confirm(`Are you sure you want to delete ${babyName}? This will permanently delete all activities for this baby.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await deleteBaby(babyId);
      if (selectedBaby?.id === babyId) {
        setSelectedBaby(null);
      }
      await refreshBabies();
    } catch (err) {
      console.error('Failed to delete baby:', err);
      setError('Failed to delete baby. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (babyId: string) => {
    if (!user || !inviteEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await inviteUser(babyId, inviteEmail.trim(), user.id);
      setInviteEmail('');
      await loadSharedUsers();
      alert('Invitation sent successfully!');
    } catch (err) {
      console.error('Failed to invite user:', err);
      setError('Failed to send invitation. The user may already have access.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (shareId: string, userName: string | null) => {
    if (!confirm(`Remove ${userName || 'this user'} from accessing this baby?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await removeShare(shareId);
      await loadSharedUsers();
    } catch (err) {
      console.error('Failed to remove user:', err);
      setError('Failed to remove user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveBaby = async (shareId: string, babyName: string) => {
    if (!confirm(`Are you sure you want to leave ${babyName}? You will lose access to all activities.`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await removeShare(shareId);
      await refreshBabies();
    } catch (err) {
      console.error('Failed to leave baby:', err);
      setError('Failed to leave baby. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = (babyId: string) => {
    const baby = babies.find((b) => b.id === babyId);
    return baby?.user_id === user?.id;
  };

  const getMyShare = (babyId: string) => {
    return sharedUsers[babyId]?.find((su) => su.user_id === user?.id);
  };

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
        <Link
          to="/"
          className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <IconDashboard className="w-5 h-5" />
        </Link>
        <span>/</span>
        <IconUser className="w-5 h-5 text-gray-500" />
        <span>/</span>
        <span className="text-gray-900">Manage Babies & Sharing</span>
      </div>

      {/* Title Section */}
      <div className="space-y-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Manage Babies & Sharing
        </h2>
        <p className="text-gray-500 text-base">
          Edit baby information and share access with caregivers
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {babies.map((baby) => {
          const owner = isOwner(baby.id);
          const myShare = getMyShare(baby.id);
          const users = sharedUsers[baby.id] || [];

          return (
            <div
              key={baby.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
            >
              {editingBaby === baby.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Baby's Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEdit(baby.id)}
                      disabled={loading}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                        colorScheme.id === "default"
                          ? "bg-gray-900 hover:bg-gray-800"
                          : colorScheme.cardBg + " hover:opacity-90"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingBaby(null)}
                      disabled={loading}
                      className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {baby.name}
                      </h2>
                      {baby.birth_date && (
                        <p className="text-sm text-gray-500">
                          Born {baby.birth_date}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {owner ? 'Owner' : 'Shared with you'}
                      </p>
                    </div>
                    {owner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditBaby(baby.id, baby.name, baby.birth_date)}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBaby(baby.id, baby.name)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {owner && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Invite Someone
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all"
                          disabled={loading}
                        />
                        <button
                          onClick={() => handleInviteUser(baby.id)}
                          disabled={loading}
                          className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                            colorScheme.id === "default"
                              ? "bg-gray-900 hover:bg-gray-800"
                              : colorScheme.cardBg + " hover:opacity-90"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {loading ? 'Inviting...' : 'Invite'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Shared With
                    </h3>
                    <div className="space-y-2">
                      {users.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No one else has access yet
                        </p>
                      ) : (
                        users.map((sharedUser) => (
                          <div
                            key={sharedUser.id}
                            className="flex items-center justify-between py-2"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {sharedUser.profiles?.full_name ||
                                  sharedUser.profiles?.email ||
                                  sharedUser.invited_email ||
                                  (sharedUser.user_id === user?.id ? user?.email : null) ||
                                  'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {sharedUser.role === 'owner' ? 'Owner' : 'Caregiver'}
                                {!sharedUser.user_id && ' (Pending)'}
                              </p>
                            </div>
                            {owner && sharedUser.role !== 'owner' && (
                              <button
                                onClick={() => handleRemoveUser(sharedUser.id, sharedUser.profiles?.full_name || null)}
                                disabled={loading}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {!owner && myShare && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleLeaveBaby(myShare.id, baby.name)}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Leave Baby
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {babies.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600 mb-4">You don't have any babies yet</p>
          <button
            onClick={() => navigate('/babies/new')}
            className={`px-6 py-2.5 rounded-lg text-white font-medium transition-colors ${
              colorScheme.id === 'default'
                ? 'bg-gray-900 hover:bg-gray-800'
                : colorScheme.cardBg + ' hover:opacity-90'
            }`}
          >
            Add Your First Baby
          </button>
        </div>
      )}
    </div>
  );
}
