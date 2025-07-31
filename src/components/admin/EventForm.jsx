import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDataContext } from '../../context/DataContext';

const EventForm = ({ event = null, onClose, onSuccess }) => {
  const { addEvent, updateEvent } = useDataContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    srs_id: '',
    name: '',
    active: false,
  });

  // If event is provided, we're editing an existing event
  useEffect(() => {
    if (event) {
      setFormData({
        srs_id: event.srs_id || '',
        name: event.name || '',
        active: event.active || false,
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.srs_id.trim()) {
        throw new Error('SRS ID is required');
      }
      
      if (!formData.name.trim()) {
        throw new Error('Event name is required');
      }

      let result;
      if (event) {
        // Update existing event
        result = await updateEvent(event.srs_id, formData);
      } else {
        // Create new event
        result = await addEvent(formData);
      }

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error || 'Failed to save event');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            {event ? 'Edit Event' : 'Add New Event'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 mb-4 mx-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="srs_id" className="block text-sm font-medium text-gray-700 mb-1">
              SRS ID
            </label>
            <input
              type="text"
              id="srs_id"
              name="srs_id"
              value={formData.srs_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              disabled={isSubmitting || event} // Cannot edit SRS ID for existing events
              required
            />
            {event && (
              <p className="mt-1 text-xs text-gray-500">SRS ID cannot be edited for existing events.</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Event Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Status
            </label>
            <div className="flex items-center">
              <button
                type="button"
                className="relative inline-flex items-center cursor-pointer"
                onClick={() => {
                  const newValue = !formData.active;
                  setFormData(prev => ({
                    ...prev,
                    active: newValue
                  }));
                }}
                disabled={isSubmitting}
                aria-pressed={formData.active}
              >
                <div className={`w-11 h-6 rounded-full transition-colors ${formData.active ? 'bg-brand' : 'bg-gray-200'} relative`}>
                  <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${formData.active ? 'translate-x-5' : ''}`}></div>
                </div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  {formData.active ? 'Active' : 'Inactive'}
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Active events will appear in the appointment booking form. Inactive events are hidden from users.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span> : 
                event ? 'Update Event' : 'Add Event'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
