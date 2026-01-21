import { createContext, useContext } from 'react';

interface ViewNavigationContextType {
  goToView: (index: number) => void;
  goToNextView: () => void;
  goToPrevView: () => void;
  currentIndex: number;
  totalViews: number;
  canGoNext: boolean;
  canGoPrev: boolean;
}

const ViewNavigationContext = createContext<ViewNavigationContextType | null>(null);

export function useViewNavigation() {
  const context = useContext(ViewNavigationContext);
  if (!context) {
    throw new Error('useViewNavigation must be used within ViewNavigationProvider');
  }
  return context;
}

export { ViewNavigationContext };
