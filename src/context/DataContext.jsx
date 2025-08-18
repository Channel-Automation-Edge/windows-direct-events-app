import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import databaseService from '../services/databaseService';

// Create the DataContext
const DataContext = createContext();

// Custom hook to use the DataContext
export const useDataContext = () => useContext(DataContext);

// DataProvider component
export const DataProvider = ({ children }) => {
  const [staffs, setStaffs] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [appointmentChoices, setAppointmentChoices] = useState([]);
  const [timeSlots, setTimeSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load all data - memoized with useCallback
  const loadAllData = useCallback(async () => {
    console.log('Loading all data...');
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all data at once from the database
      const formData = await databaseService.getFormData();
      
      if (formData) {
        setStaffs(formData.staffs || []);
        setEvents(formData.events || []);
        setActiveEvents((formData.events || []).filter(event => event.active));
        setProducts(formData.products || []);  // Using 'products' array from database - unrelated to formData.product in AppContext
        setAppointmentChoices(formData.appointment_choices || []);
        setTimeSlots(formData.time_slots || {});
      } else {
        throw new Error('Failed to fetch data from the database');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load application data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to refresh specific data type - memoized with useCallback
  const refreshData = useCallback(async (dataType) => {
    console.log('Refreshing data type:', dataType || 'all');
    setError(null);
    
    try {
      switch (dataType) {
        case 'staffs':
          const staffData = await databaseService.getStaffs();
          setStaffs(staffData);
          break;
        case 'events':
          const eventsData = await databaseService.getEvents();
          setEvents(eventsData);
          setActiveEvents(eventsData.filter(event => event.active));
          break;
        case 'products':
          const productsData = await databaseService.getProducts();
          setProducts(productsData);
          break;
        case 'appointmentChoices':
          const choicesData = await databaseService.getAppointmentTypes();
          setAppointmentChoices(choicesData);
          break;
        case 'timeSlots':
          const timeSlotsData = await databaseService.getTimeSlots();
          setTimeSlots(timeSlotsData);
          break;
        default:
          await loadAllData();
          break;
      }
    } catch (err) {
      console.error(`Error refreshing ${dataType} data:`, err);
      setError(`Failed to refresh ${dataType}. Please try again.`);
    }
  }, [loadAllData]);

  // Load all data on initial mount
  useEffect(() => {
    loadAllData();
  }, []);

  // CRUD operations for staffs
  const addStaff = async (newStaff) => {
    const result = await databaseService.addStaff(newStaff);
    if (result.success) {
      // Update local state to avoid unnecessary API call
      setStaffs(prev => [...prev, result.data]);
    }
    return result;
  };
  
  const updateStaff = async (staffId, updatedFields) => {
    const result = await databaseService.updateStaff(staffId, updatedFields);
    if (result.success) {
      // Update local state to avoid unnecessary API call
      setStaffs(prev => prev.map(staff => 
        staff.id === staffId ? { ...staff, ...updatedFields } : staff
      ));
    }
    return result;
  };
  
  const deleteStaff = async (staffId) => {
    const result = await databaseService.deleteStaff(staffId);
    if (result.success) {
      // Update local state to avoid unnecessary API call
      setStaffs(prev => prev.filter(staff => staff.id !== staffId));
    }
    return result;
  };
  
  // CRUD operations for products
  const addProduct = async (newProduct) => {
    const result = await databaseService.addProduct(newProduct);
    if (result.success) {
      setProducts(prev => [...prev, result.data]);
    }
    return result;
  };
  
  const updateProduct = async (productId, updatedFields) => {
    const result = await databaseService.updateProduct(productId, updatedFields);
    if (result.success) {
      setProducts(prev => prev.map(product => 
        product.id === productId ? { ...product, ...updatedFields } : product
      ));
    }
    return result;
  };
  
  const deleteProduct = async (productId) => {
    const result = await databaseService.deleteProduct(productId);
    if (result.success) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
    return result;
  };
  
  // CRUD operations for appointment types
  const addAppointmentType = async (newType) => {
    const result = await databaseService.addAppointmentType(newType);
    if (result.success) {
      setAppointmentChoices(prev => [...prev, result.data]);
    }
    return result;
  };
  
  const updateAppointmentType = async (typeId, updatedFields) => {
    const result = await databaseService.updateAppointmentType(typeId, updatedFields);
    if (result.success) {
      setAppointmentChoices(prev => prev.map(type => 
        type.id === typeId ? { ...type, ...updatedFields } : type
      ));
    }
    return result;
  };
  
  const deleteAppointmentType = async (typeId) => {
    const result = await databaseService.deleteAppointmentType(typeId);
    if (result.success) {
      setAppointmentChoices(prev => prev.filter(type => type.id !== typeId));
    }
    return result;
  };
  
  // CRUD operations for events
  const addEvent = async (newEvent) => {
    const result = await databaseService.addEvent(newEvent);
    if (result.success) {
      setEvents(prev => [...prev, result.data]);
      // Update activeEvents if the new event is active
      if (result.data.active) {
        setActiveEvents(prev => [...prev, result.data]);
      }
    }
    return result;
  };
  
  const updateEvent = async (srsId, updatedFields) => {
    const result = await databaseService.updateEvent(srsId, updatedFields);
    if (result.success) {
      // Update events array
      setEvents(prev => prev.map(event => 
        event.srs_id === srsId ? { ...event, ...updatedFields } : event
      ));
      
      // Also update activeEvents if needed
      if ('active' in updatedFields) {
        if (updatedFields.active) {
          // Add to active events if not already there
          setActiveEvents(prev => {
            const isAlreadyActive = prev.some(event => event.srs_id === srsId);
            if (isAlreadyActive) return prev;
            
            const updatedEvent = events.find(e => e.srs_id === srsId);
            if (updatedEvent) {
              return [...prev, { ...updatedEvent, ...updatedFields }];
            }
            return prev;
          });
        } else {
          // Remove from active events
          setActiveEvents(prev => prev.filter(event => event.srs_id !== srsId));
        }
      }
    }
    return result;
  };
  
  const deleteEvent = async (srsId) => {
    const result = await databaseService.deleteEvent(srsId);
    if (result.success) {
      setEvents(prev => prev.filter(event => event.srs_id !== srsId));
      setActiveEvents(prev => prev.filter(event => event.srs_id !== srsId));
    }
    return result;
  };

  // Bulk replace all events
  const bulkReplaceEvents = async (newEvents) => {
    const result = await databaseService.bulkReplaceEvents(newEvents);
    if (result.success) {
      // Update local state with new events
      setEvents(newEvents);
      setActiveEvents(newEvents.filter(event => event.active));
    }
    return result;
  };

  // Bulk replace all staff
  const bulkReplaceStaffs = async (newStaffs) => {
    const result = await databaseService.bulkReplaceStaffs(newStaffs);
    if (result.success) {
      // Update local state with new staff
      setStaffs(newStaffs);
    }
    return result;
  };
  
  // The value to be provided by the context
  const contextValue = {
    // Data
    staffs,
    events,
    activeEvents,
    products,
    appointmentChoices,
    timeSlots,
    
    // Status
    loading,
    error,
    
    // General data operations
    refreshData,
    loadAllData,
    
    // CRUD for staffs
    addStaff, updateStaff, deleteStaff,
    addProduct, updateProduct, deleteProduct,
    addEvent, updateEvent, deleteEvent, bulkReplaceEvents, bulkReplaceStaffs,
    
    // CRUD for appointment types
    addAppointmentType,
    updateAppointmentType,
    deleteAppointmentType
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
