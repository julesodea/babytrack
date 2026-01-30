import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useBaby } from '../contexts/BabyContext';
import { createBaby } from '../lib/api/babies';
import { useColorScheme } from '../context/ColorSchemeContext';

export function BabyNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshBabies } = useBaby();
  const { colorScheme } = useColorScheme();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a baby');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a name for your baby');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createBaby(user.id, name.trim(), birthDate || undefined);
      await refreshBabies();
      navigate('/');
    } catch (err) {
      console.error('Failed to create baby:', err);
      setError('Failed to create baby. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20 lg:pt-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Add a Baby
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Create a profile to start tracking activities
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Baby's Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Birth Date (Optional)
              </label>
              <input
                type="date"
                id="birthDate"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  colorScheme.id === 'default'
                    ? 'bg-gray-900 hover:bg-gray-800'
                    : colorScheme.cardBg + ' hover:opacity-90'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Baby'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
