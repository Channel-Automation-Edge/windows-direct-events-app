import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, Video } from 'lucide-react';

const VideoForm = ({ video, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    url: '',
    thumbnail: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (video) {
      setFormData(video);
    } else {
      // Generate ID for new video
      const newId = `video-${Date.now()}`;
      setFormData(prev => ({ ...prev, id: newId }));
    }
  }, [video]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-populate title and thumbnail when URL is entered
    if (name === 'url' && value.trim()) {
      await fetchYouTubeData(value);
    }
  };

  const extractVideoId = (url) => {
    let videoId = null;
    
    if (url.includes('youtube.com/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    
    return videoId;
  };

  const fetchYouTubeData = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) return;

    try {
      // Auto-generate thumbnail
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      
      // Fetch video title using YouTube oEmbed API
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      
      if (response.ok) {
        const data = await response.json();
        
        setFormData(prev => ({
          ...prev,
          title: prev.title.trim() === '' ? data.title : prev.title,
          thumbnail: prev.thumbnail.trim() === '' ? thumbnailUrl : prev.thumbnail
        }));
      } else {
        // If oEmbed fails, just set the thumbnail
        setFormData(prev => ({
          ...prev,
          thumbnail: prev.thumbnail.trim() === '' ? thumbnailUrl : prev.thumbnail
        }));
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      // Fallback to just setting thumbnail
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setFormData(prev => ({
        ...prev,
        thumbnail: prev.thumbnail.trim() === '' ? thumbnailUrl : prev.thumbnail
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Auto-generate thumbnail from YouTube URL if not provided
      const updatedFormData = { ...formData };
      if (updatedFormData.url && !updatedFormData.thumbnail.trim()) {
        // Handle both youtube.com/embed/ and youtube.com/watch?v= formats
        let videoId = null;
        
        if (updatedFormData.url.includes('youtube.com/embed/')) {
          videoId = updatedFormData.url.split('/embed/')[1]?.split('?')[0];
        } else if (updatedFormData.url.includes('youtube.com/watch?v=')) {
          videoId = updatedFormData.url.split('watch?v=')[1]?.split('&')[0];
        } else if (updatedFormData.url.includes('youtu.be/')) {
          videoId = updatedFormData.url.split('youtu.be/')[1]?.split('?')[0];
        }
        
        if (videoId) {
          updatedFormData.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }

      onSuccess(updatedFormData);
    } catch (err) {
      setError(err.message || 'Failed to save video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-full">
              <Video className="h-5 w-5 text-brand" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {video ? 'Edit Video' : 'Add New Video'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube URL *
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports YouTube URLs (embed, watch, or short links) - title and thumbnail will auto-populate
            </p>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter video title (auto-populated from YouTube URL)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              id="thumbnail"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="Leave empty to auto-generate from YouTube URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>


          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand hover:bg-brand/90"
            >
              {loading ? 'Saving...' : (video ? 'Update Video' : 'Add Video')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoForm;
