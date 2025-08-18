import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BGPattern } from '../components/ui/BGPattern';
import { databaseService } from '../services/databaseService';
import { getBrandSettings } from '../utils/brandStorage';
import { ArrowLeft, Calendar, MapPin, Tag } from 'lucide-react';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [brandSettings, setBrandSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formData = await databaseService.getFormData();
        const settings = getBrandSettings();
        
        const galleryData = formData?.other_custom_content?.gallery;
        const projectData = galleryData?.pastProjects?.find(p => p.id === projectId);
        
        setProject(projectData);
        setBrandSettings(settings);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/gallery?tab=past-projects">
          <Button variant="secondary" className="gap-2">
            <ArrowLeft size={18} />
            Back to Gallery
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
      
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/gallery?tab=past-projects" className="hover:text-brand transition-colors">
          Gallery
        </Link>
        <span>/</span>
        <Link to="/gallery?tab=past-projects" className="hover:text-brand transition-colors">
          Past Projects
        </Link>
        <span>/</span>
        <span className="text-gray-900">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-brand/10 text-brand text-sm font-medium rounded-full flex items-center gap-1"
              >
                <Tag size={14} />
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{project.address}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/gallery?tab=past-projects">
            <Button variant="secondary" className="gap-2">
              <ArrowLeft size={18} />
              Back to Gallery
            </Button>
          </Link>
          <Link to="/new-appointment">
            <Button className="gap-2">
              <Calendar size={18} />
              Start Your Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Image */}
      <div className="aspect-video lg:aspect-[21/9] overflow-hidden rounded-xl shadow-lg">
        <img
          src={project.project_photos[selectedImage]}
          alt={`${project.name} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Image Thumbnails */}
      {project.project_photos.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {project.project_photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-brand shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Project Description */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-fit">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{project.description}</p>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Location</span>
              <p className="text-gray-900">{project.address}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Project Type</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-brand/10 text-brand text-xs font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Card - Full Width Below */}
      <div className="bg-gradient-to-br from-brand to-brand/80 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-semibold mb-4">Ready for Your Own Transformation?</h3>
        <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
          Get a free consultation and see how we can transform your space just like this project.
        </p>
        <Link to="/new-appointment">
          <Button className="bg-white text-brand hover:bg-gray-50 border-0 px-8 py-3 text-lg">
            Schedule Free Consultation
          </Button>
        </Link>
      </div>

      {/* Related Projects CTA */}
      <div className="bg-gray-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More Projects</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Discover more of our successful basement renovation projects to get inspired for your own home transformation.
        </p>
        <Link to="/gallery?tab=past-projects">
          <Button variant="secondary" className="gap-2">
            View All Projects
            <ArrowLeft size={18} className="rotate-180" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProjectDetail;
