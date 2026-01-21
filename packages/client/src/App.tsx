import { useMemo, Suspense } from 'react';
import { Provider } from 'react-redux';
import { store, useAppSelector, useAppDispatch } from './store';
import { getTheme } from './styles/theme';
import { SwipeableViewContainer } from './components/layout/SwipeableViewContainer';
import { Header } from './components/layout/Header';
import { AlertBanner } from './components/common/AlertBanner';
import { KioskProvider, useKiosk } from './contexts/KioskContext';
import { KioskAuthDialog } from './components/common/KioskAuthDialog';
import { ErrorBoundary, ViewErrorBoundary } from './components/common/ErrorBoundary';
import { ScreenDimmerOverlay } from './components/common/ScreenDimmerOverlay';
import { useSignalK } from './hooks/useSignalK';
import { useNetworkGPS } from './hooks/useNetworkGPS';
import { useSensorData } from './hooks/useSensorData';
import { useRelayControl } from './hooks/useRelayControl';
import { useVictronControl } from './hooks/useVictronControl';
import { useWeatherData } from './hooks/useWeatherData';
import { useAlertMonitor } from './hooks/useAlertMonitor';
import { useBilgeMonitor } from './hooks/useBilgeMonitor';
import { useDataHistoryRecorder } from './hooks/useDataHistory';
import { setCurrentView } from './store/slices/viewsSlice';
import { getEnabledViews } from './views/ViewRegistry';
import type { Theme } from './styles/theme';
import './styles/global.css';

// Loading fallback component for lazy-loaded views
function ViewLoadingFallback({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.lg,
      }}
    >
      Loading...
    </div>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const themeSetting = useAppSelector((state) => state.settings.theme);
  const viewConfigs = useAppSelector((state) => state.views.views);
  const sunTimes = useAppSelector((state) => state.navigation.sunTimes);
  const { showAuthDialog, setShowAuthDialog } = useKiosk();

  // Determine actual theme mode based on setting
  const themeMode: 'day' | 'night' = useMemo(() => {
    if (themeSetting === 'auto' && sunTimes) {
      // Auto mode: use sun times to determine day/night
      const now = Date.now();
      const sunrise = sunTimes.sunrise ? new Date(sunTimes.sunrise).getTime() : 0;
      const sunset = sunTimes.sunset ? new Date(sunTimes.sunset).getTime() : 0;

      // If we have valid sun times, check if it's after sunset or before sunrise
      if (sunrise > 0 && sunset > 0) {
        return now < sunrise || now > sunset ? 'night' : 'day';
      }
    }
    // Manual mode or fallback
    return themeSetting === 'night' ? 'night' : 'day';
  }, [themeSetting, sunTimes]);

  const theme = getTheme(themeMode);

  // Initialize data connections
  useSignalK(); // SignalK WebSocket for GPS and navigation data
  useNetworkGPS(); // MQTT network GPS (configurable in settings)
  useSensorData();
  const { toggleRelay } = useRelayControl();
  useVictronControl();
  useWeatherData();
  useAlertMonitor();
  useBilgeMonitor();
  useDataHistoryRecorder();

  const handleKioskExit = () => {
    setShowAuthDialog(false);
    // Dispatch event for kiosk wrapper to handle
    window.dispatchEvent(new CustomEvent('ampmatter:exit-kiosk'));
    // Also try to minimize/close for debugging
    console.log('Kiosk exit requested - debug mode enabled');
  };

  // Get enabled views from registry
  const enabledViews = useMemo(() => getEnabledViews(viewConfigs), [viewConfigs]);

  // Create swipeable view configurations with error boundaries and lazy loading
  const swipeableViews = useMemo(
    () =>
      enabledViews.map((viewDef) => ({
        id: viewDef.id,
        name: viewDef.name,
        component: (
          <Suspense fallback={<ViewLoadingFallback theme={theme} />}>
            <ViewErrorBoundary theme={theme} viewName={viewDef.name}>
              <viewDef.component theme={theme} onToggle={toggleRelay} />
            </ViewErrorBoundary>
          </Suspense>
        ),
      })),
    [enabledViews, theme, toggleRelay]
  );

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Header theme={theme} />
      <AlertBanner theme={theme} />
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <SwipeableViewContainer
          theme={theme}
          views={swipeableViews}
          initialView={0}
          onViewChange={(_index, viewId) => {
            dispatch(setCurrentView(viewId));
          }}
        />
      </div>
      {showAuthDialog && (
        <KioskAuthDialog
          theme={theme}
          onClose={() => setShowAuthDialog(false)}
          onSuccess={handleKioskExit}
        />
      )}
      <ScreenDimmerOverlay />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <KioskProvider>
          <AppContent />
        </KioskProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
