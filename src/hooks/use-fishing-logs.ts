'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  onSnapshot,
  enableNetwork,
  disableNetwork 
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useAuth } from '@/context/AuthContext';

export interface FishingLog {
  id?: string;
  userId: string;
  date: string;
  location: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  weather: {
    temperature: number;
    conditions: string;
    windSpeed?: number;
  };
  catches: Array<{
    species: string;
    quantity: number;
    size?: number;
    weight?: number;
    photo?: string;
  }>;
  notes: string;
  duration: number; // in minutes
  bait: string[];
  techniques: string[];
  createdAt: number;
  syncStatus: 'synced' | 'pending' | 'offline';
}

export function useFishingLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FishingLog[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineLogs();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load logs from Firebase and localStorage
  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  const loadLogs = async () => {
    if (!user) return;

    try {
      // Load from localStorage first (for offline access)
      const offlineLogs = getOfflineLogs();
      setLogs(offlineLogs);

      // If online, fetch from Firebase
      if (isOnline) {
        const q = query(
          collection(db, 'fishingLogs'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const firebaseLogs: FishingLog[] = [];
          snapshot.forEach((doc) => {
            firebaseLogs.push({
              id: doc.id,
              ...doc.data(),
              syncStatus: 'synced'
            } as FishingLog);
          });

          // Merge with offline logs
          const mergedLogs = mergeLogsWithOffline(firebaseLogs, offlineLogs);
          setLogs(mergedLogs);
          
          // Update localStorage
          saveLogsToStorage(mergedLogs);
        });

        return unsubscribe;
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const addLog = async (logData: Omit<FishingLog, 'id' | 'userId' | 'createdAt' | 'syncStatus'>) => {
    if (!user) return;

    const newLog: FishingLog = {
      ...logData,
      id: generateOfflineId(),
      userId: user.uid,
      createdAt: Date.now(),
      syncStatus: isOnline ? 'synced' : 'pending'
    };

    try {
      if (isOnline) {
        // Save to Firebase
        const docRef = await addDoc(collection(db, 'fishingLogs'), {
          ...newLog,
          id: undefined // Remove the temporary ID for Firebase
        });
        newLog.id = docRef.id;
        newLog.syncStatus = 'synced';
      } else {
        // Save offline
        newLog.syncStatus = 'offline';
      }

      // Update local state and storage
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      saveLogsToStorage(updatedLogs);

      return newLog;
    } catch (error) {
      console.error('Error adding log:', error);
      
      // Fallback to offline storage
      newLog.syncStatus = 'offline';
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      saveLogsToStorage(updatedLogs);
      
      return newLog;
    }
  };

  const syncOfflineLogs = async () => {
    if (!user || !isOnline) return;

    setSyncStatus('syncing');
    const offlineLogs = logs.filter(log => log.syncStatus === 'offline' || log.syncStatus === 'pending');

    try {
      for (const log of offlineLogs) {
        const logToSync = { ...log };
        delete logToSync.id; // Remove temporary ID

        const docRef = await addDoc(collection(db, 'fishingLogs'), logToSync);
        
        // Update the log with Firebase ID
        const updatedLog = { ...log, id: docRef.id, syncStatus: 'synced' as const };
        setLogs(prevLogs => 
          prevLogs.map(l => l.id === log.id ? updatedLog : l)
        );
      }

      setSyncStatus('idle');
      console.log(`Synced ${offlineLogs.length} offline logs`);
    } catch (error) {
      console.error('Error syncing offline logs:', error);
      setSyncStatus('error');
    }
  };

  const getOfflineLogs = (): FishingLog[] => {
    try {
      const stored = localStorage.getItem(`fishingLogs_${user?.uid}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading offline logs:', error);
      return [];
    }
  };

  const saveLogsToStorage = (logsToSave: FishingLog[]) => {
    if (!user) return;
    
    try {
      localStorage.setItem(`fishingLogs_${user.uid}`, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Error saving logs to storage:', error);
    }
  };

  const mergeLogsWithOffline = (firebaseLogs: FishingLog[], offlineLogs: FishingLog[]): FishingLog[] => {
    const merged = [...firebaseLogs];
    
    // Add offline logs that haven't been synced
    offlineLogs.forEach(offlineLog => {
      if (offlineLog.syncStatus === 'offline' || offlineLog.syncStatus === 'pending') {
        const exists = merged.some(log => log.id === offlineLog.id);
        if (!exists) {
          merged.push(offlineLog);
        }
      }
    });

    // Sort by creation date
    return merged.sort((a, b) => b.createdAt - a.createdAt);
  };

  const generateOfflineId = (): string => {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const getStats = () => {
    const totalLogs = logs.length;
    const totalCatches = logs.reduce((sum, log) => 
      sum + log.catches.reduce((catchSum, catchItem) => catchSum + catchItem.quantity, 0), 0
    );
    const uniqueSpecies = new Set(
      logs.flatMap(log => log.catches.map(c => c.species))
    ).size;
    const offlineLogs = logs.filter(log => log.syncStatus === 'offline' || log.syncStatus === 'pending').length;

    return {
      totalLogs,
      totalCatches,
      uniqueSpecies,
      offlineLogs,
      syncStatus
    };
  };

  return {
    logs,
    addLog,
    syncOfflineLogs,
    isOnline,
    syncStatus,
    stats: getStats()
  };
}
