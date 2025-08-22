import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useDataContext } from '../context/DataContext';
import { BGPattern } from '../components/ui/BGPattern';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Calendar, FolderOpen, RefreshCw, Video, Play, Camera, ArrowRight } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { getBrandSettings } from '../utils/brandStorage';
import { getNavigationUrl } from '../utils/urlHelper';

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
  const [galleryData, setGalleryData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get brand settings from localStorage
        const settings = getBrandSettings();
        setBrandSettings(settings);
        
        const events = await databaseService.getEvents(true); // Get only active events
        setActiveEventsCount(events.length);

        // Get gallery data for video thumbnail
        const formData = await databaseService.getFormData();
        setGalleryData(formData?.other_custom_content?.gallery || null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setActiveEventsCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to extract video ID from YouTube URL
  const extractVideoId = (url) => {
    if (!url) return null;
    
    if (url.includes('youtube.com/embed/')) {
      return url.split('/embed/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      return url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return null;
  };

  // Get first video thumbnail
  const getFirstVideoThumbnail = () => {
    if (!galleryData?.videos || galleryData.videos.length === 0) {
      return "https://img.youtube.com/vi/zLEO9-GhJ5c/maxresdefault.jpg"; // fallback
    }
    
    const firstVideo = galleryData.videos[0];
    const videoId = extractVideoId(firstVideo.url);
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return firstVideo.thumbnail || "https://img.youtube.com/vi/zLEO9-GhJ5c/maxresdefault.jpg";
  };

  return (
    <div className="relative space-y-6">
      <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
      {/* Logo */}
      <div className="flex justify-center md:justify-start mb-8">
        <img 
          src={brandSettings?.logo || "https://f005.backblazeb2.com/file/project-starfish/logo/windows+direct+usa+logo+3.png"} 
          alt={`${brandSettings?.name || 'Your Company Name'} Logo`} 
          className="h-16 md:h-20 object-contain max-w-[270px]"
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
          Schedule your home improvement consultation appointment with our expert team. 
          Book your free in-home consultation today and discover premium home improvement solutions.
        </p>
        <div className="flex justify-center md:justify-start">
          <Link to={getNavigationUrl("/new-appointment")}>
            <Button className="gap-2 bg-white text-brand hover:bg-gray-50 border-0">
              <Calendar size={18} />
              Create Appointment
            </Button>
          </Link>
        </div>
      </div>

      

      {/* Gallery Preview Section */}
      <div className="space-y-8 py-4 md:py-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-left"
        >
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Work Showcase
            </h2>
            <div className="h-1 w-24 bg-gradient-to-r from-brand via-brand to-transparent mb-6 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Discover the quality and craftsmanship that sets us apart. Browse our portfolio of successful home improvement projects.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Featured Project */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Project */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to={getNavigationUrl("/gallery", {tab: "past-projects"})} className="group block">
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
                      alt="Featured home improvement project"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:from-brand/60 transition-all duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-brand text-white text-sm font-medium rounded-full">
                        Featured Project
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Complete Home Transformation</h3>
                    <p className="text-white/90 text-sm">Modern renovation with premium finishes and lighting</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Bottom Row - Get Started & Photos Gallery Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* New Appointment Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Link to={getNavigationUrl("/new-appointment")} className="group block">
                  <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
                        alt="Schedule consultation"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-brand/60 transition-all duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={16} className="text-white" />
                        <span className="text-white text-sm font-medium">Get Started</span>
                      </div>
                      <p className="text-white/90 text-xs">Schedule your consultation</p>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Photos Gallery Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Link to={getNavigationUrl("/gallery", {tab: "photos"})} className="group block">
                  <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
                        alt="Photo gallery preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-brand/60 transition-all duration-500"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Camera size={16} className="text-white" />
                        <span className="text-white text-sm font-medium">Photo Gallery</span>
                      </div>
                      <p className="text-white/90 text-xs">Browse our project photos</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Gallery Highlights */}
          <div className="space-y-6">
            {/* Before & After Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to={getNavigationUrl("/gallery", {tab: "before-after"})} className="group block">
                <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400"
                      alt="Before and after transformation"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-brand/60 transition-all duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw size={16} className="text-white" />
                      <span className="text-white text-sm font-medium">Before & After</span>
                    </div>
                    <p className="text-white/90 text-xs">See dramatic transformations</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Video Gallery Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link to={getNavigationUrl("/gallery", {tab: "videos"})} className="group block">
                <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={getFirstVideoThumbnail()}
                      alt="Video gallery preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-brand/60 transition-all duration-500">
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-100">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/30 transition-all duration-300">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Video size={16} className="text-white" />
                      <span className="text-white text-sm font-medium">Video Gallery</span>
                    </div>
                    <p className="text-white/90 text-xs">Watch our work in action</p>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Explore Full Gallery Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-left"
            >
              <Link to={getNavigationUrl("/gallery")} className="group inline-flex items-center gap-2 text-brand hover:text-brand/80 transition-colors duration-300">
                <span className="text-lg font-semibold">Explore Full Gallery</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
