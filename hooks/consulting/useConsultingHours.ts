import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem(CONSULTING_HOURS_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setData(parsed);
      }
    } catch (error) {
      console.error('Error loading consulting hours data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (newData: ConsultingHoursData) => {
    try {
      await AsyncStorage.setItem(CONSULTING_HOURS_KEY, JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error('Error saving consulting hours data:', error);
      throw error;
    }
  };

  const canPurchaseThisYear = (): boolean => {
    if (!data.lastPurchaseDate) {
      return true;
    }

    const lastPurchase = new Date(data.lastPurchaseDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return lastPurchase <= oneYearAgo;
  };

  const addPurchase = async (transactionId?: string) => {
    if (!canPurchaseThisYear()) {
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
  };

  const useHour = async () => {
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
  };

  const resetData = async () => {
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
  };

  const scheduleSession = async (sessionInfo: Omit<ScheduledSession, 'scheduledAt'>) => {
    if (!canScheduleThisYear()) {
      const lastScheduled = new Date(data.lastScheduledDate!);
      const nextAvailableDate = new Date(lastScheduled);
      nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

      throw new Error(
        `Ya agendaste una sesión este año. Podrás agendar nuevamente el ${nextAvailableDate.toLocaleDateString()}`
      );
    }

    const newSession: ScheduledSession = {
      ...sessionInfo,
      scheduledAt: new Date().toISOString()
    };

    const newData: ConsultingHoursData = {
      ...data,
      scheduledSessions: [...data.scheduledSessions, newSession],
      lastScheduledDate: new Date().toISOString()
    };

    await saveData(newData);
    return newSession;
  };

  const canScheduleThisYear = (): boolean => {
    if (!data.lastScheduledDate) {
      return true;
    }

    const lastScheduled = new Date(data.lastScheduledDate);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return lastScheduled <= oneYearAgo;
  };

  return {
    totalPurchased: data.totalPurchased,
    totalUsed: data.totalUsed,
    availableHours: data.availableHours,
    purchaseHistory: data.purchaseHistory,
    scheduledSessions: data.scheduledSessions,
    lastScheduledDate: data.lastScheduledDate,
    lastPurchaseDate: data.lastPurchaseDate,
    hasAvailableHours: data.availableHours > 0,
    canScheduleThisYear: canScheduleThisYear(),
    canPurchaseThisYear: canPurchaseThisYear(),
    isLoading,
    addPurchase,
    useHour,
    resetData,
    scheduleSession,
    refresh: loadData
  };
}

