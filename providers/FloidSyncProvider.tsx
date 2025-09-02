import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FloidSyncContextType {
  isSyncing: boolean;
  startSync: () => void;
  stopSync: () => void;
}

const FloidSyncContext = createContext<FloidSyncContextType | undefined>(undefined);

export const useFloidSync = () => {
  const context = useContext(FloidSyncContext);
  if (context === undefined) {
    throw new Error('useFloidSync must be used within a FloidSyncProvider');
  }
  return context;
};

interface FloidSyncProviderProps {
  children: ReactNode;
}

export const FloidSyncProvider: React.FC<FloidSyncProviderProps> = ({ children }) => {
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
      }, 70000);

      return () => clearTimeout(timer);
    }
  }, [isSyncing]);

  const value: FloidSyncContextType = {
    isSyncing,
    startSync,
    stopSync,
  };

  return (
    <FloidSyncContext.Provider value={value}>
      {children}
    </FloidSyncContext.Provider>
  );
};
