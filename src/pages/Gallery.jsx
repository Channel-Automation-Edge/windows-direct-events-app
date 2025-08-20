import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BGPattern } from '../components/ui/BGPattern';
import { databaseService } from '../services/databaseService';
import { getBrandSettings } from '../utils/brandStorage';
import { Play, Calendar, ArrowRight, FolderOpen, Video, RefreshCw, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { ImageComparisonSlider } from '../components/ui/ImageComparisonSlider';

const Gallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'past-projects');
  const [galleryData, setGalleryData] = useState(null);
  const [brandSettings, setBrandSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = await databaseService.getFormData();
        const settings = getBrandSettings();
        
        setGalleryData(formData?.other_custom_content?.gallery || null);
        setBrandSettings(settings);
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'past-projects';
    setActiveTab(tab);
    setCurrentPage(1); // Reset pagination when switching tabs
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const tabs = [
    { id: 'past-projects', label: 'Past Projects', icon: FolderOpen },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'before-after', label: 'Before & After', icon: RefreshCw },
    { id: 'photos', label: 'Photos', icon: Camera }
  ];

  const renderPagination = () => {
    if (activeTab !== 'past-projects') return null;

    if (!galleryData?.pastProjects) return null;

    // Sort projects by year (newest first)
    const sortedProjects = [...galleryData.pastProjects].sort((a, b) => b.project_year - a.project_year);
    
    // Calculate pagination for remaining projects (after first 3)
    const remainingProjects = sortedProjects.slice(3);
    const totalPages = Math.ceil(remainingProjects.length / projectsPerPage);

    if (totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center gap-4 mt-12">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft size={16} />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 p-0 ${currentPage === page ? 'bg-brand text-white' : ''}`}
            >
              {page}
            </Button>
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Work Gallery</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our portfolio of successful basement renovation projects. 
          See the quality and craftsmanship that sets us apart.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg p-1 shadow-md border border-gray-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'past-projects' && (
          <div>
            <PastProjectsTab data={galleryData?.pastProjects} currentPage={currentPage} projectsPerPage={projectsPerPage} />
            {renderPagination()}
          </div>
        )}
        {activeTab === 'videos' && <VideosTab data={galleryData?.videos} />}
        {activeTab === 'before-after' && <BeforeAfterTab data={galleryData?.beforeAfter} />}
        {activeTab === 'photos' && <PhotosTab data={galleryData?.pastProjects} />}
      </div>
    </div>
  );
};

// Past Projects Tab Component
const PastProjectsTab = ({ data, currentPage, projectsPerPage }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No past projects available at the moment.</p>
      </div>
    );
  }

  // Sort projects by year (newest first)
  const sortedProjects = [...data].sort((a, b) => b.project_year - a.project_year);
  
  // Show 3 newest projects first, then CTA, then remaining projects with pagination
  const newestProjects = sortedProjects.slice(0, 3);
  const remainingProjects = sortedProjects.slice(3);
  
  // Calculate pagination for remaining projects
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentRemainingProjects = remainingProjects.slice(startIndex, endIndex);

  return (
    <div className="space-y-12">
      {/* 3 Newest Projects */}
      {newestProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Latest Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newestProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand to-brand/80 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Join hundreds of satisfied customers who have transformed their homes with our expert basement renovation services.
        </p>
        <Link to="/new-appointment">
          <Button className="bg-white text-brand hover:bg-gray-50 border-0 gap-2">
            <Calendar size={18} />
            Get Started Today
          </Button>
        </Link>
      </div>

      {/* Remaining Projects */}
      {remainingProjects.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">More Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRemainingProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project }) => {
  return (
    <Link to={`/gallery/project/${project.id}`} className="group block h-full">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="aspect-video overflow-hidden">
          <img
            src={project.featured_image}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2 min-h-[28px]">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{project.address}</span>
            </div>
            <span className="font-medium">{project.project_year}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand transition-colors flex-1">
            {project.name}
          </h3>
          <div className="flex items-center text-brand text-sm font-medium mt-auto">
            View Project <ArrowRight size={16} className="ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// Videos Tab Component
const VideosTab = ({ data }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Function to convert YouTube URL to embed format
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // If already an embed URL, return as is
    if (url.includes('/embed/')) return url;
    
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    // Return embed URL if video ID found
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No videos available at the moment.</p>
      </div>
    );
  }

  // Sort videos by upload date (newest first)
  const sortedVideos = [...data].sort((a, b) => {
    // If both videos have upload dates, sort by date
    if (a.uploadDate && b.uploadDate) {
      return new Date(b.uploadDate) - new Date(a.uploadDate);
    }
    // If only one has upload date, prioritize it
    if (a.uploadDate && !b.uploadDate) return -1;
    if (!a.uploadDate && b.uploadDate) return 1;
    // If neither has upload date, maintain original order
    return 0;
  });
  
  // Show 3 newest videos first, then CTA, then remaining videos
  const newestVideos = sortedVideos.slice(0, 3);
  const remainingVideos = sortedVideos.slice(3);

  return (
    <div className="space-y-12">
      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="aspect-video">
              <iframe
                src={getEmbedUrl(selectedVideo.url)}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <p className="text-gray-600">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3 Newest Videos */}
      {newestVideos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Latest Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newestVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand to-brand/80 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Join hundreds of satisfied customers who have transformed their homes with our expert basement renovation services.
        </p>
        <Link to="/new-appointment">
          <Button className="bg-white text-brand hover:bg-gray-50 border-0 gap-2">
            <Calendar size={18} />
            Get Started Today
          </Button>
        </Link>
      </div>

      {/* Remaining Videos */}
      {remainingVideos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">More Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={() => setSelectedVideo(video)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Video Card Component
const VideoCard = ({ video, onPlay }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video relative overflow-hidden cursor-pointer" onClick={onPlay}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <div className="bg-white/90 rounded-full p-3 hover:bg-white transition-colors">
            <Play size={24} className="text-brand ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.title}</h3>
        <p className="text-gray-600 text-sm">{video.description}</p>
      </div>
    </div>
  );
};

// Before & After Tab Component
const BeforeAfterTab = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No before & after images available at the moment.</p>
      </div>
    );
  }

  // Sort items by date (newest first) - assuming items have a date field or use array order
  const sortedItems = [...data].reverse(); // Reverse to show newest first
  
  // Show 2 newest items first, then CTA, then remaining items
  const newestItems = sortedItems.slice(0, 2);
  const remainingItems = sortedItems.slice(2);

  return (
    <div className="space-y-12">
      {/* 2 Newest Items */}
      {newestItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Latest Transformations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {newestItems.map((item) => (
              <BeforeAfterSlider key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand to-brand/80 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Join hundreds of satisfied customers who have transformed their homes with our expert basement renovation services.
        </p>
        <Link to="/new-appointment">
          <Button className="bg-white text-brand hover:bg-gray-50 border-0 gap-2">
            <Calendar size={18} />
            Get Started Today
          </Button>
        </Link>
      </div>

      {/* Remaining Items */}
      {remainingItems.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">More Transformations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {remainingItems.map((item) => (
              <BeforeAfterSlider key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Before & After Slider Component
const BeforeAfterSlider = ({ item }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <ImageComparisonSlider
          leftImage={item.beforeImage}
          rightImage={item.afterImage}
          altLeft={`${item.title} - Before`}
          altRight={`${item.title} - After`}
          className="w-full h-full"
        />
        
        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          Before
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
          After
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
        <p className="text-gray-600 text-sm">{item.description}</p>
      </div>
    </div>
  );
};

// Photos Tab Component
const PhotosTab = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No photos available at the moment.</p>
      </div>
    );
  }

  // Extract all photos from past projects (featured images and gallery images)
  const allPhotos = [];
  data.forEach((project) => {
    // Add featured image
    if (project.featured_image) {
      allPhotos.push({
        id: `${project.id}-featured`,
        url: project.featured_image,
        title: `${project.name} - Featured`,
        projectName: project.name,
        projectYear: project.project_year
      });
    }
    
    // Add gallery images if they exist
    if (project.gallery_images && Array.isArray(project.gallery_images)) {
      project.gallery_images.forEach((image, index) => {
        allPhotos.push({
          id: `${project.id}-gallery-${index}`,
          url: image,
          title: `${project.name} - Photo ${index + 1}`,
          projectName: project.name,
          projectYear: project.project_year
        });
      });
    }
  });

  // Show first 3 photos, then CTA, then remaining photos
  const firstThreePhotos = allPhotos.slice(0, 3);
  const remainingPhotos = allPhotos.slice(3);

  return (
    <div className="space-y-12">
      {/* First 3 Photos */}
      {firstThreePhotos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Latest Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstThreePhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-brand to-brand/80 rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Project?</h2>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Join hundreds of satisfied customers who have transformed their homes with our expert basement renovation services.
        </p>
        <Link to="/new-appointment">
          <Button className="bg-white text-brand hover:bg-gray-50 border-0 gap-2">
            <Calendar size={18} />
            Get Started Today
          </Button>
        </Link>
      </div>

      {/* Remaining Photos */}
      {remainingPhotos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">More Photos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Photo Card Component
const PhotoCard = ({ photo }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video overflow-hidden">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
};

export default Gallery;
