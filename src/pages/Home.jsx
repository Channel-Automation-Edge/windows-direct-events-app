import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { databaseService } from '../services/databaseService';

const Home = () => {
  const [activeEventsCount, setActiveEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      try {
        const events = await databaseService.getEvents(true); // Get only active events
        setActiveEventsCount(events.length);
      } catch (error) {
        console.error('Error fetching active events:', error);
        setActiveEventsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEvents();
  }, []);

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="flex justify-center md:justify-start mb-8">
        <img 
          src="https://f005.backblazeb2.com/file/project-starfish/logo/windows+direct+usa+logo+3.png" 
          alt="Windows Direct USA Logo" 
          className="h-16 md:h-20 object-contain"
        />
      </div>

      {/* Hero Card */}
      <div className="bg-gray-50 rounded-xl shadow-md p-8 w-full text-center md:text-left">
        <h1 className="text-3xl font-bold mb-4">Welcome to Event App</h1>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto md:mx-0">
          Schedule your appointments easily with our intuitive booking system. 
          Get started by creating a new appointment.
        </p>
        <div className="flex justify-center md:justify-start">
          <Link to="/new-appointment">
            <Button className="gap-2">
              <Calendar size={18} />
              Create Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md text-center md:text-left">
          <h2 className="text-lg font-medium mb-2">Active Events</h2>
          {loading ? (
            <p className="text-3xl font-bold text-gray-400">...</p>
          ) : (
            <p className="text-3xl font-bold text-brand">{activeEventsCount}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">Currently active</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md text-center md:text-left">
          <h2 className="text-lg font-medium mb-2">Total Appointments</h2>
          <p className="text-3xl font-bold text-brand">156</p>
          <p className="text-sm text-gray-500 mt-2">This month</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
