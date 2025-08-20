import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, FolderOpen, Plus, Trash2 } from 'lucide-react';

const ProjectForm = ({ project, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tags: ['Basement Remodeling'],
    address: '',
    description: '',
    featured_image: '',
    project_photos: [''],
    project_year: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        project_photos: project.project_photos || ['']
      });
    } else {
      // Generate ID for new project
      const newId = `project-${Date.now()}`;
      setFormData(prev => ({ ...prev, id: newId }));
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handlePhotoChange = (index, value) => {
    const newPhotos = [...formData.project_photos];
    newPhotos[index] = value;
    setFormData(prev => ({ ...prev, project_photos: newPhotos }));
  };

  const addPhotoField = () => {
    setFormData(prev => ({
      ...prev,
      project_photos: [...prev.project_photos, '']
    }));
  };

  const removePhotoField = (index) => {
    if (formData.project_photos.length > 1) {
      const newPhotos = formData.project_photos.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, project_photos: newPhotos }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Filter out empty photo URLs
      const filteredPhotos = formData.project_photos.filter(photo => photo.trim());
      
      // Use featured image as first photo if no photos provided
      const finalPhotos = filteredPhotos.length > 0 ? filteredPhotos : [formData.featured_image];
      
      const finalData = {
        ...formData,
        project_photos: finalPhotos
      };

      onSuccess(finalData);
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-full">
              <FolderOpen className="h-5 w-5 text-brand" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {project ? 'Edit Project' : 'Add New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="City, State"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project_year" className="block text-sm font-medium text-gray-700 mb-1">
              Completion Year *
            </label>
            <input
              type="number"
              id="project_year"
              name="project_year"
              value={formData.project_year}
              onChange={handleChange}
              required
              min="2000"
              max="2030"
              placeholder="2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags *
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              required
              placeholder="Basement Remodeling, Windows, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          <div>
            <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL *
            </label>
            <input
              type="url"
              id="featured_image"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              required
              placeholder="https://example.com/featured-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Photos
            </label>
            <div className="space-y-2">
              {formData.project_photos.map((photo, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={photo}
                    onChange={(e) => handlePhotoChange(index, e.target.value)}
                    placeholder={`Photo ${index + 1} URL`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  {formData.project_photos.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePhotoField(index)}
                      className="px-3 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhotoField}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Photo
              </Button>
            </div>
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
              rows={4}
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
              {loading ? 'Saving...' : (project ? 'Update Project' : 'Add Project')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
