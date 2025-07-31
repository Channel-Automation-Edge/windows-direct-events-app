import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="
                    /* Mobile: Full width floating dock */
                    fixed bottom-4 left-4 right-4 z-50
                    bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200/50
                    rounded-2xl px-4 py-3 flex-row w-auto h-auto
                    /* Desktop: Traditional sidebar */
                    sm:fixed sm:bottom-auto sm:left-0 sm:top-0 sm:right-auto
                    sm:w-16 md:w-20 sm:h-screen sm:flex-col sm:justify-start
                    sm:bg-white sm:shadow-md sm:rounded-none sm:border-none sm:px-4 sm:py-6">
      <div className="mb-6 hidden sm:block">
        <img src="/images/logo.png" alt="Windows Direct Logo" className="h-8 w-auto" />
      </div>
      
      <nav className="flex sm:flex-col items-center justify-around w-full sm:space-y-8">
        <NavLink 
          to="/" 
          className={({isActive}) => `flex flex-col sm:flex-row items-center justify-center p-2 rounded-md transition-colors duration-200 ${
            isActive ? 'bg-gray-50 text-brand' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Home size={20} className="sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 sm:hidden font-medium">Home</span>
        </NavLink>
        
        <NavLink 
          to="/new-appointment" 
          className={({isActive}) => `flex flex-col sm:flex-row items-center justify-center p-2 rounded-md transition-colors duration-200 ${
            isActive ? 'bg-gray-50 text-brand' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Calendar size={20} className="sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 sm:hidden font-medium">Book</span>
        </NavLink>
        
        <NavLink 
          to="/admin" 
          className={({isActive}) => `flex flex-col sm:flex-row items-center justify-center p-2 rounded-md transition-colors duration-200 ${
            isActive ? 'bg-gray-50 text-brand' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Settings size={20} className="sm:w-6 sm:h-6" />
          <span className="text-xs mt-1 sm:hidden font-medium">Admin</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
