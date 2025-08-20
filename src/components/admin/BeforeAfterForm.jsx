import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, RefreshCw } from 'lucide-react';

const BeforeAfterForm = ({ beforeAfter, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    beforeImage: '',
    afterImage: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (beforeAfter) {
      setFormData(beforeAfter);
    } else {
      // Generate ID for new before/after
      const newId = `ba-${Date.now()}`;
      setFormData(prev => ({ ...prev, id: newId }));
    }
  }, [beforeAfter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      onSuccess(formData);
    } catch (err) {
      setError(err.message || 'Failed to save before/after');
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
              <RefreshCw className="h-5 w-5 text-brand" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {beforeAfter ? 'Edit Before/After' : 'Add New Before/After'}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="beforeImage" className="block text-sm font-medium text-gray-700 mb-1">
              Before Image URL *
            </label>
            <input
              type="url"
              id="beforeImage"
              name="beforeImage"
              value={formData.beforeImage}
              onChange={handleChange}
              required
              placeholder="https://example.com/before-image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
            />
          </div>

          <div>
            <label htmlFor="afterImage" className="block text-sm font-medium text-gray-700 mb-1">
              After Image URL *
            </label>
            <input
              type="url"
              id="afterImage"
              name="afterImage"
              value={formData.afterImage}
              onChange={handleChange}
              required
              placeholder="https://example.com/after-image.jpg"
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
              rows={3}
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
              {loading ? 'Saving...' : (beforeAfter ? 'Update Before/After' : 'Add Before/After')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BeforeAfterForm;
