import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSULTING_HOURS_KEY = '@patrimore_consulting_hours';

interface ScheduledSession {
  bookingId: string;
  scheduledDate: string;
  advisorName: string;
  scheduledAt: string;
}

interface ConsultingHoursData {
  totalPurchased: number;
  totalUsed: number;
  availableHours: number;
  purchaseHistory: {
    date: string;
    transactionId?: string;
  }[];
  scheduledSessions: ScheduledSession[];
  lastScheduledDate?: string;
  lastPurchaseDate?: string;
}

export function useConsultingHours() {
  const [data, setData] = useState<ConsultingHoursData>({
    totalPurchased: 0,
    totalUsed: 0,
    availableHours: 0,
    purchaseHistory: [],
    scheduledSessions: [],
    lastScheduledDate: undefined,
    lastPurchaseDate: undefined
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem(CONSULTING_HOURS_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setData(parsed);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(async (newData: ConsultingHoursData) => {
    try {
      await AsyncStorage.setItem(CONSULTING_HOURS_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      throw error;
    }
  }, []);

  const canPurchaseThisYear = useMemo(() => {
    if (!data.lastPurchaseDate) return true;
    const lastPurchase = new Date(data.lastPurchaseDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastPurchase <= oneYearAgo;
  }, [data.lastPurchaseDate]);

  const canScheduleThisYear = useMemo(() => {
    if (!data.lastScheduledDate) return true;
    const lastScheduled = new Date(data.lastScheduledDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastScheduled <= oneYearAgo;
  }, [data.lastScheduledDate]);


  const addPurchase = useCallback(async (transactionId?: string) => {
    if (!canPurchaseThisYear) {
      const lastPurchase = new Date(data.lastPurchaseDate!);
      const nextAvailableDate = new Date(lastPurchase);
      nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

      throw new Error(
        `Ya compraste una hora este año. Podrás comprar nuevamente el ${nextAvailableDate.toLocaleDateString()}`
      );
    }

    const now = new Date().toISOString();
    const newData: ConsultingHoursData = {
      totalPurchased: data.totalPurchased + 1,
      totalUsed: data.totalUsed,
      availableHours: data.availableHours + 1,
      purchaseHistory: [
        ...data.purchaseHistory,
        {
          date: now,
          transactionId
        }
      ],
      scheduledSessions: data.scheduledSessions,
      lastScheduledDate: data.lastScheduledDate,
      lastPurchaseDate: now
    };
    await saveData(newData);
    return newData;
  }, [canPurchaseThisYear, data, saveData]);

  const useHour = useCallback(async () => {
    if (data.availableHours <= 0) {
      throw new Error('No available consulting hours');
    }

    const newData: ConsultingHoursData = {
      ...data,
      totalUsed: data.totalUsed + 1,
      availableHours: data.availableHours - 1
    };
    await saveData(newData);
    return newData;
  }, [data, saveData]);

  const resetData = useCallback(async () => {
    const emptyData: ConsultingHoursData = {
      totalPurchased: 0,
      totalUsed: 0,
      availableHours: 0,
      purchaseHistory: [],
      scheduledSessions: [],
      lastScheduledDate: undefined,
      lastPurchaseDate: undefined
    };
    await saveData(emptyData);
  }, [saveData]);

  const scheduleSession = useCallback(async (sessionInfo: Omit<ScheduledSession, 'scheduledAt'>) => {
    if (!canScheduleThisYear) {
      const lastScheduled = new Date(data.lastScheduledDate!);
      const nextAvailableDate = new Date(lastScheduled);
      nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

      throw new Error(
        `Puedes comprar y agendar sólo una sesión este año.`
      );
    }

    const newSession: ScheduledSession = {
      ...sessionInfo,
      scheduledAt: new Date().toISOString()
    };

    const now = new Date().toISOString();
    const newData: ConsultingHoursData = {
      ...data,
      scheduledSessions: [...data.scheduledSessions, newSession],
      lastScheduledDate: now
    };

    await saveData(newData);

    return newSession;
  }, [canScheduleThisYear, data, saveData]);

  return {
    totalPurchased: data.totalPurchased,
    totalUsed: data.totalUsed,
    availableHours: data.availableHours,
    purchaseHistory: data.purchaseHistory,
    scheduledSessions: data.scheduledSessions,
    lastScheduledDate: data.lastScheduledDate,
    lastPurchaseDate: data.lastPurchaseDate,
    hasAvailableHours: data.availableHours > 0,
    canScheduleThisYear,
    canPurchaseThisYear,
    isLoading,
    addPurchase,
    useHour,
    resetData,
    scheduleSession,
    refresh: loadData
  };
}

