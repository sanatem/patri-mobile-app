import { useState, useEffect } from 'react';

export const useFloidSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const startSync = () => {
    setIsSyncing(true);
  };

  const stopSync = () => {
    setIsSyncing(false);
  };

  useEffect(() => {
    if (isSyncing) {
      const timer = setTimeout(() => {
        setIsSyncing(false);
      }, 120000);

      return () => clearTimeout(timer);
    }
  }, [isSyncing]);

  return {
    isSyncing,
    startSync,
    stopSync
  };
};
