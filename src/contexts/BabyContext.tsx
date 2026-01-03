import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getAccessibleBabies } from '../lib/api/babies';
import type { Baby } from '../types/database';

interface BabyContextType {
  babies: Baby[];
  selectedBaby: Baby | null;
  setSelectedBaby: (baby: Baby | null) => void;
  loading: boolean;
  refreshBabies: () => Promise<void>;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export function BabyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [babies, setBabies] = useState<Baby[]>([]);
  const [selectedBaby, setSelectedBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshBabies = async () => {
    if (!user) {
      setBabies([]);
      setSelectedBaby(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const accessibleBabies = await getAccessibleBabies(user.id);
      setBabies(accessibleBabies);

      // Auto-select baby logic
      if (accessibleBabies.length > 0) {
        // Try to restore previously selected baby from localStorage
        const savedBabyId = localStorage.getItem('selectedBabyId');
        const babyToSelect = savedBabyId
          ? accessibleBabies.find((b) => b.id === savedBabyId) ||
            accessibleBabies[0]
          : accessibleBabies[0];

        setSelectedBaby(babyToSelect);
      } else {
        setSelectedBaby(null);
      }
    } catch (error) {
      console.error('Failed to load babies:', error);
      setBabies([]);
      setSelectedBaby(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBabies();
  }, [user]);

  // Save selected baby to localStorage whenever it changes
  useEffect(() => {
    if (selectedBaby) {
      localStorage.setItem('selectedBabyId', selectedBaby.id);
    }
  }, [selectedBaby]);

  return (
    <BabyContext.Provider
      value={{ babies, selectedBaby, setSelectedBaby, loading, refreshBabies }}
    >
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const context = useContext(BabyContext);
  if (context === undefined) {
    throw new Error('useBaby must be used within a BabyProvider');
  }
  return context;
}
