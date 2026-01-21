import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface KioskContextType {
  showAuthDialog: boolean;
  setShowAuthDialog: (show: boolean) => void;
  handleTitleClick: () => void;
  clickCount: number;
}

const KioskContext = createContext<KioskContextType | null>(null);

// Obfuscated password storage - not secure but prevents casual grep discovery
// The actual password is constructed at runtime
const getAuthKey = (): string => {
  const parts = [
    String.fromCharCode(77), // M
    String.fromCharCode(65, 109, 112), // Amp
    String.fromCharCode(77, 97, 116, 116, 101, 114), // Matter
    String.fromCharCode(77, 33), // M!
  ];
  return parts.join('');
};

export function verifyAuthKey(input: string): boolean {
  return input === getAuthKey();
}

// Number of clicks required to show auth dialog
const REQUIRED_CLICKS = 10;
// Reset counter after this many ms of inactivity
const CLICK_TIMEOUT = 3000;

export function KioskProvider({ children }: { children: ReactNode }) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const resetTimerRef = useRef<number | null>(null);

  const handleTitleClick = useCallback(() => {
    // Clear existing reset timer
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    setClickCount((prev) => {
      const newCount = prev + 1;

      if (newCount >= REQUIRED_CLICKS) {
        // Show auth dialog and reset counter
        setShowAuthDialog(true);
        return 0;
      }

      return newCount;
    });

    // Set new reset timer
    resetTimerRef.current = window.setTimeout(() => {
      setClickCount(0);
    }, CLICK_TIMEOUT);
  }, []);

  return (
    <KioskContext.Provider value={{
      showAuthDialog,
      setShowAuthDialog,
      handleTitleClick,
      clickCount,
    }}>
      {children}
    </KioskContext.Provider>
  );
}

export function useKiosk() {
  const context = useContext(KioskContext);
  if (!context) {
    throw new Error('useKiosk must be used within KioskProvider');
  }
  return context;
}
