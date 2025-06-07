import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectUserTimezone, getQuickTimezone, hasCachedIPTimezone } from '../utils/timezoneDetection';

interface TimezoneContextType {
  userTimezone: string;
  setUserTimezone: (timezone: string) => void;
  isTimezoneReady: boolean;
  isFromIP: boolean;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

interface TimezoneProviderProps {
  children: ReactNode;
}

export const TimezoneProvider: React.FC<TimezoneProviderProps> = ({ children }) => {
  const [userTimezone, setUserTimezone] = useState<string>(getQuickTimezone());
  const [isTimezoneReady, setIsTimezoneReady] = useState<boolean>(false);
  const [isFromIP, setIsFromIP] = useState<boolean>(false);

  useEffect(() => {
    const initializeTimezone = async () => {
      try {
        // Check if we already have cached IP timezone
        if (hasCachedIPTimezone()) {
          const cachedTimezone = getQuickTimezone();
          setUserTimezone(cachedTimezone);
          setIsFromIP(true);
          setIsTimezoneReady(true);
          return;
        }

        // Pre-detect timezone for the entire app
        const detectedTimezone = await detectUserTimezone();
        
        // Only update if different from current
        if (detectedTimezone !== userTimezone) {
          setUserTimezone(detectedTimezone);
          setIsFromIP(true);
        }
        
        setIsTimezoneReady(true);
      } catch (error) {
        console.warn('Timezone detection failed, using system timezone');
        // Use system timezone as fallback
        setIsTimezoneReady(true);
        setIsFromIP(false);
      }
    };

    initializeTimezone();
  }, []);

  const handleTimezoneChange = (newTimezone: string) => {
    setUserTimezone(newTimezone);
    // Don't change isFromIP when user manually changes timezone
  };

  return (
    <TimezoneContext.Provider 
      value={{ 
        userTimezone, 
        setUserTimezone: handleTimezoneChange, 
        isTimezoneReady,
        isFromIP 
      }}
    >
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = () => {
  const context = useContext(TimezoneContext);
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider');
  }
  return context;
};

// Export for backwards compatibility if needed
export default TimezoneProvider;