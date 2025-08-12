import { NavLink } from 'react-router-dom';
import { Home, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
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
      <div className="mb-6 hidden sm:block">
        <img src="/images/logo.png" alt="Windows Direct Logo" className="h-8 w-auto" />
      </div>
      
      <nav className="flex sm:flex-col items-center justify-around w-full sm:space-y-8">
        <NavLink 
          to="/" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Home size={20} className="sm:w-6 sm:h-6" />
          <span className="text-base font-medium sm:text-xs sm:mt-1 sm:hidden">Home</span>
        </NavLink>
        
        <NavLink 
          to="/new-appointment" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Calendar size={20} className="sm:w-6 sm:h-6" />
          <span className="text-base font-medium sm:text-xs sm:mt-1 sm:hidden">Book</span>
        </NavLink>
        
        <NavLink 
          to="/admin" 
          className={({isActive}) => `flex flex-row items-center justify-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-0 active:bg-transparent ${
            isActive ? 'text-brand' : 'text-gray-600 hover:text-brand hover:bg-gray-50'
          } sm:flex-col sm:gap-0 sm:rounded-md sm:px-2`}
        >
          <Settings size={20} className="sm:w-6 sm:h-6" />
          <span className="text-base font-medium sm:text-xs sm:mt-1 sm:hidden">Admin</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
