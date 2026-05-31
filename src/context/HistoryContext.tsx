import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type HistoryItem = {
  episodeSlug: string;
  seriesSlug: string;
  title: string;
  seriesTitle: string;
  poster: string;
  timestamp: number;
  progress: number; // in seconds
};

type HistoryContextType = {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
  updateProgress: (episodeSlug: string, progress: number) => void;
  removeFromHistory: (episodeSlug: string) => void;
  getHistoryItem: (episodeSlug: string) => HistoryItem | undefined;
  loading: boolean;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const HISTORY_STORAGE_KEY = '@filmieo_history';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const saveHistory = async (newHistory: HistoryItem[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    }
  };

  const addToHistory = useCallback((item: Omit<HistoryItem, 'timestamp'>) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.episodeSlug !== item.episodeSlug);
      const newHistory = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 50); // Keep last 50
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const updateProgress = useCallback((episodeSlug: string, progress: number) => {
    setHistory((prev) => {
      const index = prev.findIndex((h) => h.episodeSlug === episodeSlug);
      if (index === -1) return prev;

      const newHistory = [...prev];
      newHistory[index] = { ...newHistory[index], progress, timestamp: Date.now() };
      
      // Move to front
      const [item] = newHistory.splice(index, 1);
      newHistory.unshift(item);

      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const removeFromHistory = useCallback((episodeSlug: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((h) => h.episodeSlug !== episodeSlug);
      saveHistory(newHistory);
      return newHistory;
    });
  }, []);

  const getHistoryItem = useCallback((episodeSlug: string) => {
    return history.find((h) => h.episodeSlug === episodeSlug);
  }, [history]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, updateProgress, removeFromHistory, getHistoryItem, loading }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
