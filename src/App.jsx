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

  return (
    <DataProvider>
      <AppProvider>
        <Router>
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
        </Router>
      </AppProvider>
    </DataProvider>
  );
};

export default App;
