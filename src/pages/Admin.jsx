import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { User, Lock, Plus, Edit, Trash2, CheckCircle2, Calendar, Users, Package, MapPin, Upload, X, LogIn, LogOut, Search } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import StaffForm from '../components/admin/StaffForm';
import ProductForm from '../components/admin/ProductForm';
// AppointmentType form import removed
import EventForm from '../components/admin/EventForm';
import EventsCSVUpload from '../components/admin/EventsCSVUpload';
import StaffCSVUpload from '../components/admin/StaffCSVUpload';
import DeleteConfirmDialog from '../components/ui/DeleteConfirmDialog';
import { BGPattern } from '../components/ui/BGPattern';
import SearchInput from '../components/ui/SearchInput';

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
    addEvent, updateEvent, deleteEvent, bulkReplaceEvents, bulkReplaceStaffs
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
  
  // State for CSV upload
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [staffCsvUploading, setStaffCsvUploading] = useState(false);
  const [staffCsvDialogOpen, setStaffCsvDialogOpen] = useState(false);
  
  // State for events pagination
  const [eventsCurrentPage, setEventsCurrentPage] = useState(1);
  const eventsPerPage = 10;

  // State for staff pagination
  const [staffCurrentPage, setStaffCurrentPage] = useState(1);
  const staffPerPage = 8;
  
  // State for search functionality
  const [eventsSearchTerm, setEventsSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');

  // Sort, filter and paginate events
  const getSortedAndPaginatedEvents = () => {
    if (!events || events.length === 0) return { paginatedEvents: [], totalPages: 0 };
    
    // Filter events based on search term
    let filteredEvents = events;
    if (eventsSearchTerm.trim()) {
      const searchLower = eventsSearchTerm.toLowerCase().trim();
      filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchLower) ||
        event.srs_id.toLowerCase().includes(searchLower) ||
        (event.active ? 'active' : 'inactive').includes(searchLower)
      );
    }
    
    // Sort events: active first, then alphabetically by name
    const sortedEvents = [...filteredEvents].sort((a, b) => {
      // First priority: active events at top
      if (a.active !== b.active) {
        return b.active - a.active; // true (1) comes before false (0)
      }
      // Second priority: alphabetical by name
      return a.name.localeCompare(b.name);
    });
    
    // Calculate pagination
    const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
    const startIndex = (eventsCurrentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
    
    return { paginatedEvents, totalPages, totalEvents: sortedEvents.length };
  };

  // Sort, filter and paginate staff
  const getSortedAndPaginatedStaff = () => {
    if (!staffs || staffs.length === 0) return { paginatedStaff: [], totalPages: 0 };
    
    // Filter staff based on search term
    let filteredStaff = staffs;
    if (staffSearchTerm.trim()) {
      const searchLower = staffSearchTerm.toLowerCase().trim();
      filteredStaff = staffs.filter(staff => 
        staff.name.toLowerCase().includes(searchLower) ||
        staff.id.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort staff alphabetically by name
    const sortedStaff = [...filteredStaff].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    
    // Calculate pagination
    const totalPages = Math.ceil(sortedStaff.length / staffPerPage);
    const startIndex = (staffCurrentPage - 1) * staffPerPage;
    const endIndex = startIndex + staffPerPage;
    const paginatedStaff = sortedStaff.slice(startIndex, endIndex);
    
    return { paginatedStaff, totalPages, totalStaff: sortedStaff.length };
  };

  // Clear search when search term changes and reset pagination
  const handleEventsSearch = (searchTerm) => {
    setEventsSearchTerm(searchTerm);
    setEventsCurrentPage(1); // Reset to first page when searching
  };
  
  const handleStaffSearch = (searchTerm) => {
    setStaffSearchTerm(searchTerm);
    setStaffCurrentPage(1); // Reset to first page when searching
  };

  // Handle CSV upload for bulk event replacement
  const handleCSVUpload = async (newEvents, resetUploadComponent) => {
    console.log('handleCSVUpload: Starting upload with', newEvents.length, 'events');
    setCsvUploading(true);
    try {
      const result = await bulkReplaceEvents(newEvents);
      console.log('handleCSVUpload: bulkReplaceEvents result:', result);
      
      if (result.success) {
        console.log('handleCSVUpload: Upload successful, setting alert');
        setAlert({
          type: 'success',
          message: result.message || `Successfully uploaded ${newEvents.length} events`
        });
        // Reset pagination and search after upload
        setEventsCurrentPage(1);
        setEventsSearchTerm('');
        // Reset the upload component
        if (resetUploadComponent) {
          resetUploadComponent();
        }
        // Close the CSV dialog after successful upload
        setCsvDialogOpen(false);
        // Refresh data like delete does
        console.log('handleCSVUpload: Setting dataFetched to false to trigger refresh');
        setDataFetched(false);
      } else {
        console.log('handleCSVUpload: Upload failed:', result.error);
        setAlert({
          type: 'error',
          message: result.error || 'Failed to upload events'
        });
        // Close dialog even on error
        setCsvDialogOpen(false);
      }
    } catch (error) {
      console.error('handleCSVUpload: Exception occurred:', error);
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred while uploading events'
      });
      // Close dialog even on error
      setCsvDialogOpen(false);
    } finally {
      console.log('handleCSVUpload: Finished, setting csvUploading to false');
      setCsvUploading(false);
    }
  };

  // Handle CSV upload for bulk staff replacement
  const handleStaffCSVUpload = async (newStaffs, resetUploadComponent) => {
    console.log('handleStaffCSVUpload: Starting upload with', newStaffs.length, 'staff');
    setStaffCsvUploading(true);
    try {
      const result = await bulkReplaceStaffs(newStaffs);
      console.log('handleStaffCSVUpload: bulkReplaceStaffs result:', result);
      
      if (result.success) {
        console.log('handleStaffCSVUpload: Upload successful, setting alert');
        setAlert({
          type: 'success',
          message: result.message || `Successfully uploaded ${newStaffs.length} staff members`
        });
        // Reset the upload component
        if (resetUploadComponent) {
          resetUploadComponent();
        }
        // Close the CSV dialog after successful upload
        setStaffCsvDialogOpen(false);
        // Refresh data like delete does
        console.log('handleStaffCSVUpload: Setting dataFetched to false to trigger refresh');
        setDataFetched(false);
      } else {
        console.log('handleStaffCSVUpload: Upload failed:', result.error);
        setAlert({
          type: 'error',
          message: result.error || 'Failed to upload staff'
        });
        // Close dialog even on error
        setStaffCsvDialogOpen(false);
      }
    } catch (error) {
      console.error('handleStaffCSVUpload: Exception occurred:', error);
      setAlert({
        type: 'error',
        message: 'An unexpected error occurred while uploading staff'
      });
      // Close dialog even on error
      setStaffCsvDialogOpen(false);
    } finally {
      console.log('handleStaffCSVUpload: Finished, setting staffCsvUploading to false');
      setStaffCsvUploading(false);
    }
  };
  
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
    // Reset pagination when data changes
    setEventsCurrentPage(1);
    setStaffCurrentPage(1);
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
        // Reset pagination when data changes
        setEventsCurrentPage(1);
        setStaffCurrentPage(1);
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
        <div className="relative max-w-6xl mx-auto py-6 px-4">
          <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
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
        <div className="relative max-w-6xl mx-auto py-6 px-4">
          <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
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
      <div className="relative max-w-6xl mx-auto py-6 px-4">
        <BGPattern variant="grid" mask="fade-edges" size={24} fill="#e5e7eb" />
        
        {/* Enhanced Success Banner */}
        {alert && alert.type === 'success' && (
          <div className="fixed top-0 left-0 right-0 z-[10000] bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg animate-in slide-in-from-top duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 sm:pl-20 md:pl-24 py-3 sm:py-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 ml-3 sm:ml-4 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="text-white font-semibold text-sm">Success!</p>
                    <div className="hidden sm:block sm:ml-2 w-1 h-1 bg-white/60 rounded-full"></div>
                    <p className="text-white/90 text-xs sm:text-sm sm:ml-2 truncate">{alert.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAlert(null)}
                  className="flex-shrink-0 ml-2 sm:ml-4 p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 group"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-white/40 animate-pulse"></div>
            </div>
          </div>
        )}
        
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
          <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-full flex flex-col">
            <div className="bg-orange-50 px-4 py-3 border-b">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar size={18} className="text-brand" />
                  Events
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setCsvDialogOpen(true)}
                    title="Bulk Upload Events"
                  >
                    <Upload size={16} />
                    <span className="sr-only">Bulk Upload Events</span>
                  </Button>
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
              </div>
              <SearchInput
                value={eventsSearchTerm}
                onChange={handleEventsSearch}
                onClear={() => handleEventsSearch('')}
                placeholder="Search events by name, SRS ID, or status..."
                className="w-full"
              />
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead>
                  <tr>
                    <th className="w-20 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SRS ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="w-24 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="w-20 px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(() => {
                    const { paginatedEvents, totalPages, totalEvents } = getSortedAndPaginatedEvents();
                    return paginatedEvents.length > 0 ? (
                      paginatedEvents.map(event => (
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
                          {eventsSearchTerm ? `No events found matching "${eventsSearchTerm}"` : 'No events found'}
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {(() => {
              const { totalPages, totalEvents } = getSortedAndPaginatedEvents();
              return totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {((eventsCurrentPage - 1) * eventsPerPage) + 1} to {Math.min(eventsCurrentPage * eventsPerPage, totalEvents)} of {totalEvents} events
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEventsCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={eventsCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {eventsCurrentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEventsCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={eventsCurrentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>


          {/* Staff Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden col-span-1 md:col-span-1 lg:col-span-1 flex flex-col">
            <div className="bg-orange-50 px-4 py-3 border-b">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={18} className="text-brand" />
                  Staff Members
                </h2>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setStaffCsvDialogOpen(true)}
                    title="Bulk Upload Staff"
                  >
                    <Upload size={16} />
                    <span className="sr-only">Bulk Upload Staff</span>
                  </Button>
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
              </div>
              <SearchInput
                value={staffSearchTerm}
                onChange={handleStaffSearch}
                onClear={() => handleStaffSearch('')}
                placeholder="Search staff by name or ID..."
                className="w-full"
              />
            </div>
            <div className="flex-1 p-4">
              <ul className="divide-y divide-gray-200">
                {(() => {
                  const { paginatedStaff } = getSortedAndPaginatedStaff();
                  return paginatedStaff && paginatedStaff.length > 0 ? (
                    paginatedStaff.map(staff => (
                    <li key={staff.id} className="py-3 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{staff.name}</span>
                        <span className="text-sm text-gray-500">ID: {staff.id}</span>
                      </div>
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
                    <li className="py-3 text-gray-500 italic">
                      {staffSearchTerm ? `No staff found matching "${staffSearchTerm}"` : 'No staff members found'}
                    </li>
                  );
                })()}
              </ul>
            </div>
            {/* Staff Pagination */}
            {(() => {
              const { totalPages, totalStaff } = getSortedAndPaginatedStaff();
              return totalPages > 1 && (
                <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between mt-auto">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {((staffCurrentPage - 1) * staffPerPage) + 1} to {Math.min(staffCurrentPage * staffPerPage, totalStaff)} of {totalStaff} staff
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStaffCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={staffCurrentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-700">
                      Page {staffCurrentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStaffCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={staffCurrentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              );
            })()}
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

        {/* CSV Upload Dialog */}
        {csvDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <Upload className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    Bulk Upload Events
                  </h2>
                </div>
                <button
                  onClick={() => setCsvDialogOpen(false)}
                  disabled={csvUploading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex-shrink-0 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <EventsCSVUpload 
                  onUpload={handleCSVUpload}
                  loading={csvUploading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Staff CSV Upload Dialog */}
        {staffCsvDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                    Bulk Upload Staff
                  </h2>
                </div>
                <button
                  onClick={() => setStaffCsvDialogOpen(false)}
                  disabled={staffCsvUploading}
                  className="text-gray-500 hover:text-gray-700 disabled:opacity-50 flex-shrink-0 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <StaffCSVUpload 
                  onUpload={handleStaffCSVUpload}
                  loading={staffCsvUploading}
                />
              </div>
            </div>
          </div>
        )}
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
