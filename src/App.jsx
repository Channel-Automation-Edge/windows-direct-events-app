import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';

// Pages
import Home from './pages/Home';
import NewAppointment from './pages/NewAppointment';
import Gallery from './pages/Gallery';
import ProjectDetail from './pages/ProjectDetail';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

// Components
import Sidebar from './components/Sidebar';
import BrandLoadingScreen from './components/ui/BrandLoadingScreen';

// Services and Utils
import { databaseService } from './services/databaseService';
import { loadBrandSettings, fetchAndApplyBrandSettings } from './utils/faviconUpdater';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

const App = () => {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [brandLoading, setBrandLoading] = useState(true);
  const [brandSettings, setBrandSettings] = useState(null);
  
  // Check localStorage on first render for saved authentication state
  useEffect(() => {
    const savedAuthState = localStorage.getItem('isAdminAuth');
    if (savedAuthState) {
      setIsAdminAuth(JSON.parse(savedAuthState));
    }
  }, []);
  
  // Update localStorage whenever auth state changes
  useEffect(() => {
    localStorage.setItem('isAdminAuth', JSON.stringify(isAdminAuth));
  }, [isAdminAuth]);

  // Initialize brand settings globally
  useEffect(() => {
    const initializeBrandSettings = async () => {
      try {
        // Load brand settings with smart loading logic
        const brandLoadResult = await loadBrandSettings(databaseService);
        
        if (brandLoadResult.needsLoading) {
          setBrandLoading(true);
          // Fetch and apply fresh brand settings
          const freshSettings = await fetchAndApplyBrandSettings(databaseService);
          setBrandSettings(freshSettings);
        } else {
          // Use cached valid settings and apply them to DOM
          const cachedSettings = brandLoadResult.settings;
          setBrandSettings(cachedSettings);
          
          // Apply cached settings to DOM immediately
          if (cachedSettings.favicon) {
            const { updateFavicon } = await import('./utils/faviconUpdater');
            updateFavicon(cachedSettings.favicon);
          }
          if (cachedSettings.accentColor) {
            const { updateBrandColors } = await import('./utils/faviconUpdater');
            updateBrandColors(cachedSettings.accentColor, cachedSettings.accentDark, cachedSettings.accentDarker, cachedSettings.accentRgba);
          }
        }
        
        setBrandLoading(false);
      } catch (error) {
        console.error('Error initializing brand settings:', error);
        setBrandLoading(false);
      }
    };

    initializeBrandSettings();
  }, []);

  return (
    <DataProvider>
      <AppProvider>
        <Router>
          <BrandLoadingScreen isLoading={brandLoading}>
            <div className="min-h-screen flex bg-gray-50 text-gray-800 font-sans">
              <Sidebar />
              <main className="flex-grow p-4 md:p-8 pb-20 sm:pb-4 sm:ml-16 md:ml-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/new-appointment" element={<NewAppointment />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/gallery/project/:projectId" element={<ProjectDetail />} />
                  <Route 
                    path="/admin" 
                    element={<Admin isAuth={isAdminAuth} onAuthenticate={setIsAdminAuth} />} 
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrandLoadingScreen>
        </Router>
      </AppProvider>
    </DataProvider>
  );
};

export default App;
