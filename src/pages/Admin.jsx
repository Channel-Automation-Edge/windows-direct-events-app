import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { LogOut, Lock, User, LogIn, Edit, Calendar, Users, Package, Clock, FileText, Plus, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import StaffForm from '../components/admin/StaffForm';
import ProductForm from '../components/admin/ProductForm';
// AppointmentType form import removed
import EventForm from '../components/admin/EventForm';
import DeleteConfirmDialog from '../components/ui/DeleteConfirmDialog';

const Admin = ({ isAuth, onAuthenticate }) => {
  // All hooks at the top level of the component
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [dataFetched, setDataFetched] = useState(false);
  const { 
    // Data
    staffs, products, events, 
    timeSlots: time_slots, 
    // Status
    loading, error: dataError, 
    // General operations
    refreshData,
    // CRUD operations
    addStaff, updateStaff, deleteStaff,
    addProduct, updateProduct, deleteProduct,
    addEvent, updateEvent, deleteEvent
  } = useDataContext();
  
  // State for modals
  const [activeModal, setActiveModal] = useState(null); // 'staff', 'product', 'event'
  const [editItem, setEditItem] = useState(null); // Item being edited
  
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    type: null,
    id: null,
    name: '',
    idField: 'id',
    isDeleting: false
  });
  
  // Alert state for success/error messages
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }
  
  // Refresh data only when authentication state changes from false to true
  // or when the user explicitly requests a refresh through the Try Again button
  useEffect(() => {
    if (isAuth && !dataFetched) {
      console.log('Admin: Fetching data on auth or refresh request');
      refreshData();
      setDataFetched(true);
    }
  }, [isAuth, dataFetched, refreshData]);
  
  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);
  
  // Modal control functions
  const openModal = (type, item = null) => {
    setActiveModal(type);
    setEditItem(item);
  };
  
  const closeModal = () => {
    setActiveModal(null);
    setEditItem(null);
  };
  
  // Success handler for form submissions
  const handleSuccess = (message) => {
    closeModal();
    setAlert({ type: 'success', message });
    // Ensure we refresh data after an action
    setDataFetched(false);
  };
  
  // Handle deletion with confirmation
  const handleDelete = (type, id, name, idField = 'id') => {
    setDeleteDialog({
      isOpen: true,
      type,
      id,
      name,
      idField,
      isDeleting: false
    });
  };
  
  // Confirm deletion
  const confirmDelete = async () => {
    const { type, id, name } = deleteDialog;
    
    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));
    
    try {
      let result;
      
      switch (type) {
        case 'staff':
          result = await deleteStaff(id);
          break;
        case 'product':
          result = await deleteProduct(id);
          break;
        case 'appointmentType':
          result = await deleteAppointmentType(id);
          break;
        case 'event':
          result = await deleteEvent(id);
          break;
        default:
          throw new Error('Invalid item type');
      }
      
      if (result.success) {
        setAlert({ type: 'success', message: `${name} has been deleted successfully.` });
        // Refresh data
        setDataFetched(false);
      } else {
        setAlert({ type: 'error', message: result.error || `Failed to delete ${name}.` });
      }
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      // Close dialog
      setDeleteDialog({
        isOpen: false,
        type: null,
        id: null,
        name: '',
        idField: 'id',
        isDeleting: false
      });
    }
  };
  
  // Cancel deletion
  const cancelDelete = () => {
    setDeleteDialog({
      isOpen: false,
      type: null,
      id: null,
      name: '',
      idField: 'id',
      isDeleting: false
    });
  };
  
  // Login form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get admin credentials from environment variables with no fallbacks for security
    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    // Verify environment variables are set
    if (!adminUsername || !adminPassword) {
      console.error('Admin credentials not properly configured in environment variables');
      setError('System error: Authentication not properly configured');
      return;
    }
    
    // Compare credentials using constant-time comparison to prevent timing attacks
    const usernameMatch = formData.username === adminUsername;
    const passwordMatch = formData.password === adminPassword;
    
    if (usernameMatch && passwordMatch) {
      onAuthenticate(true);
      setError('');
    } else {
      setError('Invalid username or password');
      onAuthenticate(false);
    }
  };
  
  // If user is already authenticated, show admin dashboard
  if (isAuth) {
    
    if (loading) {
      return (
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button 
              variant="secondary" 
              onClick={() => onAuthenticate(false)}
              className="gap-2 text-red-500 hover:text-red-600"
            >
              <LogOut size={18} />
              Log Out
            </Button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (dataError) {
      return (
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button 
              variant="secondary" 
              onClick={() => onAuthenticate(false)}
              className="gap-2 text-red-500 hover:text-red-600"
            >
              <LogOut size={18} />
              Log Out
            </Button>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
            <p className="font-bold">Error Loading Data</p>
            <p>{dataError}</p>
            <div className="mt-3">
              <Button 
                onClick={() => {
                  setDataFetched(false); // Reset flag to allow data fetch
                  refreshData();
                }} 
                className="gap-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="secondary" 
            onClick={() => onAuthenticate(false)}
            className="gap-2 text-red-500 hover:text-red-600"
          >
            <LogOut size={18} />
            Log Out
          </Button>
        </div>

        {/* Admin cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Events Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-full">
            <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Calendar size={18} className="text-brand" />
                Events
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => openModal('event')}
              >
                <Plus size={16} />
                <span className="sr-only">Add Event</span>
              </Button>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SRS ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events && events.length > 0 ? (
                    events.map(event => (
                      <tr key={event.srs_id}>
                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{event.srs_id}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{event.name}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${event.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {event.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => openModal('event', event)}
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              <Edit size={16} />
                              <span className="sr-only">Edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete('event', event.srs_id, event.name, 'srs_id')}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-3 py-6 text-center text-gray-500 italic">
                        No events found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-1 md:col-span-1 lg:col-span-1">
            <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Users size={18} className="text-brand" />
                Staff Members
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => openModal('staff')}
              >
                <Plus size={16} />
                <span className="sr-only">Add Staff</span>
              </Button>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {staffs && staffs.length > 0 ? (
                  staffs.map(staff => (
                    <li key={staff.id} className="py-3 flex items-center justify-between">
                      <span className="text-gray-800">{staff.name}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openModal('staff', staff)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Edit size={16} />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete('staff', staff.id, staff.name)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-gray-500 italic">No staff members found</li>
                )}
              </ul>
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-1 md:col-span-1 lg:col-span-2">
            <div className="bg-orange-50 px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package size={18} className="text-brand" />
                Products
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => openModal('product')}
              >
                <Plus size={16} />
                <span className="sr-only">Add Product</span>
              </Button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products && products.length > 0 ? (
                products.map(product => (
                  <div key={product.id} className="border rounded-md overflow-hidden relative group">
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal('product', product)}
                        className="p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-900"
                      >
                        <Edit size={16} />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete('product', product.id, product.name)}
                        className="p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                    <div className="h-40 bg-gray-100 flex items-center justify-center p-2">
                      <img 
                        src={product.image || 'https://placehold.co/400x300?text=No+Image'} 
                        alt={product.name} 
                        className="h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-800">{product.name}</h3>
                      <p className="text-xs text-gray-500">ID: {product.id}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-6 text-gray-500 italic">
                  No products found
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Modals for editing data */}
        {activeModal === 'staff' && (
          <StaffForm 
            staff={editItem}
            onClose={closeModal}
            onSuccess={(data) => handleSuccess(`Staff ${editItem ? 'updated' : 'added'} successfully!`)}
          />
        )}
        
        {activeModal === 'product' && (
          <ProductForm 
            product={editItem}
            onClose={closeModal}
            onSuccess={(data) => handleSuccess(`Product ${editItem ? 'updated' : 'added'} successfully!`)}
          />
        )}
        
        {/* Appointment type modal removed */}
        
        {activeModal === 'event' && (
          <EventForm 
            event={editItem}
            onClose={closeModal}
            onSuccess={(data) => handleSuccess(`Event ${editItem ? 'updated' : 'added'} successfully!`)}
          />
        )}
        
        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete this ${deleteDialog.type}?`}
          itemName={deleteDialog.name}
          isDeleting={deleteDialog.isDeleting}
        />
      </div>
    );
  }
  
  // Otherwise show login form
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full gap-2"
          >
            <LogIn size={18} />
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
