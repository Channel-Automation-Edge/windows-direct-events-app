import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings, Image } from 'lucide-react';
import { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';
import { applyBrandSettings } from '../utils/faviconUpdater';
import { getBrandSettings } from '../utils/brandStorage';

const Sidebar = () => {
  const [brandSettings, setBrandSettings] = useState(null);

  useEffect(() => {
    const initializeBrandSettings = async () => {
      try {
        const settings = await applyBrandSettings(databaseService);
        setBrandSettings(settings);
      } catch (error) {
        console.error('Error initializing brand settings:', error);
        // Fallback to cached settings
        const cached = getBrandSettings();
        setBrandSettings(cached);
      }
    };

    initializeBrandSettings();
  }, []);

  return (
    <aside className="
                    /* Mobile: Fully round floating dock */
                    fixed bottom-4 left-4 right-4 z-[9999]
                    bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50
                    rounded-full px-6 py-2 flex-row w-auto h-auto
                    /* Desktop: Traditional sidebar */
                    sm:fixed sm:bottom-auto sm:left-0 sm:top-0 sm:right-auto
                    sm:w-16 md:w-20 sm:h-screen sm:flex-col sm:justify-start
                    sm:bg-white sm:shadow-md sm:rounded-none sm:border-none sm:px-4 sm:py-6">
      <div className="mb-6 hidden sm:flex sm:justify-center">
        <img 
          src={brandSettings?.favicon || "/images/logo.png"} 
          alt="Windows Direct Logo" 
          className="h-8 w-auto" 
        />
      </div>
      
      <nav className="flex sm:flex-col items-center justify-around w-full sm:space-y-8">
        <NavLink 
          to="/" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Home size={20} />
          <span className="hidden sm:inline text-xs font-medium">Home</span>
        </NavLink>
        
        <NavLink 
          to="/gallery" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Image size={20} />
          <span className="hidden sm:inline text-xs font-medium">Gallery</span>
        </NavLink>

        <NavLink 
          to="/new-appointment" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Calendar size={20} />
          <span className="hidden sm:inline text-xs font-medium">Book</span>
        </NavLink>
        
        <NavLink 
          to="/admin" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Settings size={20} />
          <span className="hidden sm:inline text-xs font-medium">Admin</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
