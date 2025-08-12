import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDataContext } from '../../context/DataContext';

const ProductForm = ({ product = null, onClose, onSuccess }) => {
  const { addProduct, updateProduct } = useDataContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    image: '',
  });

  // If product is provided, we're editing an existing product
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.name || '',
        image: product.image || '',
      });
    }
  }, [product]);

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
        throw new Error('Product name is required');
      }

      // For new products, don't require ID (it will be generated)
      // For existing products, ID is required
      if (product && !formData.id) {
        throw new Error('Product ID is required for updates');
      }

      let result;
      if (product) {
        // Update existing product (including ID if changed)
        result = await updateProduct(product.id, {
          id: formData.id,
          name: formData.name,
          image: formData.image,
        });
      } else {
        // Create new product
        result = await addProduct({
          id: formData.id ? formData.id.trim() : undefined,
          name: formData.name,
          image: formData.image,
        });
      }

      if (result.success) {
        onSuccess(result.data);
      } else {
        setError(result.error || 'Failed to save product');
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
            {product ? 'Edit Product' : 'Add New Product'}
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
              Product ID {!product && "(Optional)"}
            </label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              disabled={isSubmitting}
              placeholder={!product ? "Leave blank for auto-generated ID" : "Enter product ID"}
              required={!!product}
            />
            {!product && (
              <p className="mt-1 text-xs text-gray-500">
                If left blank, an ID will be automatically generated.
              </p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
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
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              disabled={isSubmitting}
            />
          </div>

          {formData.image && (
            <div className="mb-4 p-2 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                <img
                  src={formData.image}
                  alt="Product preview"
                  className="max-h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400x300?text=Image+Not+Found";
                  }}
                />
              </div>
            </div>
          )}

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
                product ? 'Update Product' : 'Add Product'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
