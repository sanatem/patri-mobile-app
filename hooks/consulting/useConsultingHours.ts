import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases from 'react-native-purchases';
import { validateConsultingPurchase, canPurchaseConsultingHour } from '@/services/consulting/validate-purchase';

const CONSULTING_HOURS_KEY = '@patrimore_consulting_hours';
const LAST_SCHEDULED_DATE_ATTRIBUTE = 'consulting_last_scheduled_date';

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
  const [revenueCatPurchaseDate, setRevenueCatPurchaseDate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const storedData = await AsyncStorage.getItem(CONSULTING_HOURS_KEY);
      let localData: ConsultingHoursData = {
        totalPurchased: 0,
        totalUsed: 0,
        availableHours: 0,
        purchaseHistory: [],
        scheduledSessions: [],
        lastScheduledDate: undefined,
        lastPurchaseDate: undefined
      };

      if (storedData) {
        localData = JSON.parse(storedData);
      }

      setData(localData);

      const purchaseValidation = await validateConsultingPurchase();
      if (purchaseValidation.hasPurchased) {
        setRevenueCatPurchaseDate(purchaseValidation.purchaseDate!);
      } else {
        setRevenueCatPurchaseDate(null);
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

  const availableHours = useMemo(() => {
    if (!revenueCatPurchaseDate) {
      return 0;
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (revenueCatPurchaseDate <= oneYearAgo) {
      return 0;
    }

    if (data.lastScheduledDate) {
      const lastScheduled = new Date(data.lastScheduledDate);

      if (lastScheduled >= revenueCatPurchaseDate) {
        return 0;
      }
    }

    return 1;
  }, [revenueCatPurchaseDate, data.lastScheduledDate]);

  const canPurchaseThisYear = useMemo(() => {
    if (!revenueCatPurchaseDate) return true;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return revenueCatPurchaseDate <= oneYearAgo;
  }, [revenueCatPurchaseDate]);

  const canScheduleThisYear = useMemo(() => {
    
    if (!revenueCatPurchaseDate) return true;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (revenueCatPurchaseDate <= oneYearAgo) return true;

    if (data.lastScheduledDate) {
      const lastScheduled = new Date(data.lastScheduledDate);
      if (lastScheduled >= revenueCatPurchaseDate) {
        return false;
      }
    }

    return true;
  }, [revenueCatPurchaseDate, data.lastScheduledDate]);

  const hasActivePurchase = useMemo(() => {
    if (!revenueCatPurchaseDate) return false;

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return revenueCatPurchaseDate > oneYearAgo;
  }, [revenueCatPurchaseDate]);


  const addPurchase = useCallback(async (transactionId?: string) => {
    await loadData();
  }, [loadData]);

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

    try {
      await Purchases.setAttributes({
        [LAST_SCHEDULED_DATE_ATTRIBUTE]: null
      });
    } catch (error) {
    }

    await loadData();
  }, [saveData, loadData]);

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

    try {
      await Purchases.setAttributes({
        [LAST_SCHEDULED_DATE_ATTRIBUTE]: now
      });
    } catch (error) {
    }

    return newSession;
  }, [canScheduleThisYear, data, saveData]);

  return {
    totalPurchased: data.totalPurchased,
    totalUsed: data.totalUsed,
    availableHours,
    purchaseHistory: data.purchaseHistory,
    scheduledSessions: data.scheduledSessions,
    lastScheduledDate: data.lastScheduledDate,
    lastPurchaseDate: revenueCatPurchaseDate?.toISOString(),
    hasAvailableHours: availableHours > 0,
    hasActivePurchase,
    canScheduleThisYear,
    canPurchaseThisYear,
    isLoading,
    addPurchase,
    resetData,
    scheduleSession,
    refresh: loadData
  };
}

