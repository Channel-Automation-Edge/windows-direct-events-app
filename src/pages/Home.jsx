import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useDataContext } from '../context/DataContext';
import { BGPattern } from '../components/ui/BGPattern';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Calendar, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { getBrandSettings } from '../utils/brandStorage';

// Counter animation component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const animation = animate(count, value, {
      duration,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest);
    });

    return () => {
      animation.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span>{displayValue}</span>;
};

const Home = () => {
  const [activeEventsCount, setActiveEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [brandSettings, setBrandSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get brand settings from localStorage
        const settings = getBrandSettings();
        setBrandSettings(settings);
        
        const events = await databaseService.getEvents(true); // Get only active events
        setActiveEventsCount(events.length);
      } catch (error) {
        console.error('Error fetching data:', error);
        setActiveEventsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="relative space-y-6">
      <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
      {/* Logo */}
      <div className="flex justify-center md:justify-start mb-8">
        <img 
          src={brandSettings?.logo || "https://f005.backblazeb2.com/file/project-starfish/logo/windows+direct+usa+logo+3.png"} 
          alt={`${brandSettings?.name || 'Your Company Name'} Logo`} 
          className="h-16 md:h-20 object-contain"
        />
      </div>

      {/* Hero Card */}
      <div 
        className="rounded-xl shadow-lg p-8 w-full text-center md:text-left"
        style={{
          background: brandSettings?.accentColor 
            ? `linear-gradient(to bottom right, ${brandSettings.accentColor}, ${brandSettings.accentColor || brandSettings.accentColor + 'dd'}, ${brandSettings.accentDark || brandSettings.accentColor + 'bb'})`
            : 'linear-gradient(to bottom right, #f97316, #ea580c, #dc2626)'
        }}
      >
        <h1 className="text-3xl font-bold mb-4 text-white">Welcome to {brandSettings?.name || 'Your Company Name'}</h1>
        <p className="text-orange-50 mb-6 max-w-2xl mx-auto md:mx-0">
          Schedule your basement renovation consultation appointment with our expert team. 
          Book your free in-home consultation today and discover premium basement renovation solutions.
        </p>
        <div className="flex justify-center md:justify-start">
          <Link to="/new-appointment">
            <Button className="gap-2 bg-white text-brand hover:bg-gray-50 border-0">
              <Calendar size={18} />
              Create Appointment
            </Button>
          </Link>
        </div>
      </div>

      

      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Events Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-brand/10 to-transparent rounded-bl-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Active Events</h2>
              </div>
            </div>
            <div className="mb-3">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin"></div>
                  <span className="text-2xl font-bold text-gray-400">Loading...</span>
                </div>
              ) : (
                <motion.p 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-4xl font-bold text-brand"
                >
                  <AnimatedCounter value={activeEventsCount} duration={2.5} />
                </motion.p>
              )}
            </div>
            <p className="text-sm text-gray-600 font-medium">Currently active</p>
            <div className="absolute bottom-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
              <TrendingUp className="w-8 h-8 text-brand" />
            </div>
          </div>
        </motion.div>
        
        {/* Total Appointments Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="group relative overflow-hidden bg-gradient-to-br from-white via-orange-50 to-orange-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100/50"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-brand" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Total Appointments</h2>
              </div>
            </div>
            <div className="mb-3">
              <motion.p 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="text-4xl font-bold text-brand"
              >
                <AnimatedCounter value={156} duration={3} />
              </motion.p>
            </div>
            <p className="text-sm text-gray-600 font-medium">This month</p>
            <div className="absolute bottom-2 right-2 opacity-20 group-hover:opacity-30 transition-opacity">
              <CalendarIcon className="w-8 h-8 text-brand" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
