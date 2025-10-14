import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONSULTING_HOURS_KEY = '@patrimore_consulting_hours';

interface ConsultingHoursData {
  totalPurchased: number;
  totalUsed: number;
  availableHours: number;
  purchaseHistory: {
    date: string;
    transactionId?: string;
  }[];
}

export function useConsultingHours() {
  const [data, setData] = useState<ConsultingHoursData>({
    totalPurchased: 0,
    totalUsed: 0,
    availableHours: 0,
    purchaseHistory: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
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

  const addPurchase = async (transactionId?: string) => {
    const newData: ConsultingHoursData = {
      totalPurchased: data.totalPurchased + 1,
      totalUsed: data.totalUsed,
      availableHours: data.availableHours + 1,
      purchaseHistory: [
        ...data.purchaseHistory,
        {
          date: new Date().toISOString(),
          transactionId
        }
      ]
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
      purchaseHistory: []
    };
    await saveData(emptyData);
  };

  return {
    totalPurchased: data.totalPurchased,
    totalUsed: data.totalUsed,
    availableHours: data.availableHours,
    purchaseHistory: data.purchaseHistory,
    hasAvailableHours: data.availableHours > 0,
    isLoading,
    addPurchase,
    useHour,
    resetData,
    refresh: loadData
  };
}

