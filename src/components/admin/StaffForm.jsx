import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDataContext } from '../../context/DataContext';

const StaffForm = ({ staff = null, onClose, onSuccess }) => {
  const { addStaff, updateStaff } = useDataContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
  });

  // If staff is provided, we're editing an existing staff
  useEffect(() => {
    if (staff) {
      setFormData({
        id: staff.id || '',
        name: staff.name || '',
      });
    }
  }, [staff]);

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
        throw new Error('Staff name is required');
      }

      // For existing staff, validate ID is provided
      if (staff && !formData.id) {
        throw new Error('Employee ID is required for updates');
      }

      let result;
      if (staff) {
        // Update existing staff (including ID if changed)
        result = await updateStaff(staff.id, {
          id: formData.id,
          name: formData.name,
        });
      } else {
        // Create new staff
        result = await addStaff({
          id: formData.id || undefined,
          name: formData.name,
        });
      }

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error || 'Failed to save staff member');
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
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
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
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
              Employee ID {!staff && "(Optional)"}
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              disabled={isSubmitting}
              placeholder={!staff ? "Leave blank for auto-generated ID" : "Enter employee ID"}
              required={!!staff}
            />
            {!staff && (
              <p className="mt-1 text-xs text-gray-500">
                If left blank, an ID will be automatically generated.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Staff Name
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
                staff ? 'Update Staff' : 'Add Staff'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
