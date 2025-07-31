import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDataContext } from '../../context/DataContext';

const AppointmentTypeForm = ({ appointmentType = null, onClose, onSuccess }) => {
  const { addAppointmentType, updateAppointmentType } = useDataContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  // If appointmentType is provided, we're editing an existing type
  useEffect(() => {
    if (appointmentType) {
      setFormData({
        name: appointmentType.name || '',
      });
    }
  }, [appointmentType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Appointment type name is required');
      }

      let result;
      if (appointmentType) {
        // Update existing appointment type
        result = await updateAppointmentType(appointmentType.id, formData);
      } else {
        // Create new appointment type
        result = await addAppointmentType(formData);
      }

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error || 'Failed to save appointment type');
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
            {appointmentType ? 'Edit Appointment Type' : 'Add New Appointment Type'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type Name
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
                appointmentType ? 'Update Type' : 'Add Type'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentTypeForm;
