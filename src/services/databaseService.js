import supabase from '../config/supabase';

/**
 * Database service to handle Supabase operations
 * Fetches data from the contractors table with id=203853
 */
export const databaseService = {
  // The ID of the form app record in the database
  FORM_APP_ID: 203853,
  
  /**
   * Get the current form app data structure
   * Private helper method to get the current state before updates
   * @returns {Promise<Object>} - The current form app data
   */
  _getCurrentFormData: async () => {
    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .eq('id', databaseService.FORM_APP_ID)
      .single();
      
    if (error) throw error;
    return data;
  },
  
  /**
   * Update the form app data
   * Private helper method to update the entire form app data structure
   * @param {Object} updatedData - The updated form app data
   * @returns {Promise<Object>} - The updated form app data
   */
  _updateFormData: async (updatedData) => {
    const { data, error } = await supabase
      .from('contractors')
      .update(updatedData)
      .eq('id', databaseService.FORM_APP_ID)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },
  /**
   * Get the form app data from the database
   * @returns {Promise<Object>} - Object containing all form data
   */
  getFormData: async () => {
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', databaseService.FORM_APP_ID)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching form data:', error);
      // Return null on error - application should handle this case
      return null;
    }
  },

  /**
   * Get all staff members
   * @returns {Promise<Array>} - Array of staff members
   */
  getStaffs: async () => {
    try {
      const data = await databaseService.getFormData();
      return data?.staffs || [];
    } catch (error) {
      console.error('Error fetching staffs:', error);
      return [];
    }
  },

  /**
   * Get events, optionally filtered by active status
   * @param {boolean} activeOnly - Whether to get only active events
   * @returns {Promise<Array>} - Array of events
   */
  getEvents: async (activeOnly = false) => {
    try {
      const data = await databaseService.getFormData();
      let events = data?.events || [];
      
      if (activeOnly && events.length > 0) {
        events = events.filter(event => event.active);
      }
      
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  /**
   * Get all products
   * @returns {Promise<Array>} - Array of products
   */
  getProducts: async () => {
    try {
      const data = await databaseService.getFormData();
      return data?.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },
  
  /**
   * Get all appointment types
   * @returns {Promise<Array>} - Array of appointment types
   */
  getAppointmentTypes: async () => {
    try {
      const data = await databaseService.getFormData();
      return data?.appointment_choices || [];
    } catch (error) {
      console.error('Error fetching appointment types:', error);
      return [];
    }
  },

  /**
   * Get all time slots
   * @returns {Promise<Object>} - Object containing time slots by day
   */
  getTimeSlots: async () => {
    try {
      const data = await databaseService.getFormData();
      return data?.time_slots || {};
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return {};
    }
  },

  /**
   * Save appointment data to a separate appointments table
   * @param {Object} appointmentData - The appointment data to save
   * @returns {Promise<Object>} - The saved appointment data
   */
  saveAppointment: async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
  },

  /*
   * CRUD operations for staff members
   */
  addStaff: async (newStaff) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Generate a new ID if not provided
      if (!newStaff.id) {
        // Generate a text ID based on staff name (3 characters)
        let staffCode;
        
        // Try to use first 3 chars of staff name if possible
        if (newStaff.name && newStaff.name.length >= 3) {
          // Use first 3 chars of staff name
          staffCode = newStaff.name.substring(0, 3);
        } else if (newStaff.name) {
          // If name is shorter than 3 chars, pad with random chars
          const namePart = newStaff.name.substring(0, 1).toUpperCase();
          const randomPart = Math.random().toString(36).substring(2, 4);
          staffCode = namePart + randomPart;
        } else {
          // If no name, use 'STF' as fallback
          staffCode = 'STF';
        }
        
        // Ensure the code is properly formatted (first letter capitalized, rest as is)
        staffCode = staffCode.charAt(0).toUpperCase() + staffCode.substring(1);
        
        // Ensure ID is unique by checking against existing IDs
        const existingIds = (currentData.staffs || []).map(staff => staff.id);
        let newId = staffCode;
        let counter = 0;
        
        // If ID exists, add a number suffix
        while (existingIds.includes(newId)) {
          counter++;
          newId = staffCode + counter;
        }
        
        // Set the generated ID
        console.log('Generated staff ID:', newId);
        newStaff.id = newId;
      }
      
      // Add new staff to the array
      const updatedStaffs = [...(currentData.staffs || []), newStaff];
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, staffs: updatedStaffs });
      return { success: true, data: newStaff };
    } catch (error) {
      console.error('Error adding staff:', error);
      return { success: false, error: error.message };
    }
  },
  
  updateStaff: async (staffId, updatedFields) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Find and update the staff member
      let updatedStaff = null;
      const updatedStaffs = (currentData.staffs || []).map(staff => {
        if (staff.id === staffId) {
          updatedStaff = { ...staff, ...updatedFields };
          return updatedStaff;
        }
        return staff;
      });
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, staffs: updatedStaffs });
      return { success: true, data: updatedStaff };
    } catch (error) {
      console.error('Error updating staff:', error);
      return { success: false, error: error.message };
    }
  },
  
  deleteStaff: async (staffId) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Remove staff member
      const updatedStaffs = (currentData.staffs || []).filter(staff => staff.id !== staffId);
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, staffs: updatedStaffs });
      return { success: true };
    } catch (error) {
      console.error('Error deleting staff:', error);
      return { success: false, error: error.message };
    }
  },

  /*
   * CRUD operations for products
   */
  addProduct: async (newProduct) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Generate a new ID if not provided
      if (!newProduct.id) {
        // Generate a string ID based on the product name (3 characters)
        let productCode;
        
        // Try to use first 3 chars of product name if possible
        if (newProduct.name && newProduct.name.length >= 3) {
          // Use first 3 chars of product name
          productCode = newProduct.name.substring(0, 3);
        } else if (newProduct.name) {
          // If name is shorter than 3 chars, pad with random chars
          const namePart = newProduct.name.substring(0, 1).toUpperCase();
          const randomPart = Math.random().toString(36).substring(2, 4);
          productCode = namePart + randomPart;
        } else {
          // If no name, use 'PRD' as fallback
          productCode = 'PRD';
        }
        
        // Ensure the code is properly formatted (first letter capitalized, rest as is)
        productCode = productCode.charAt(0).toUpperCase() + productCode.substring(1);
        
        // Ensure ID is unique by checking against existing IDs
        const existingIds = (currentData.products || []).map(product => product.id);
        let newId = productCode;
        let counter = 0;
        
        // If ID exists, add a number suffix
        while (existingIds.includes(newId)) {
          counter++;
          newId = productCode + counter;
        }
        
        // Set the generated ID
        console.log('Generated product ID:', newId);
        newProduct.id = newId;
      }
      
      // Add new product to the array
      const updatedProducts = [...(currentData.products || []), newProduct];
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, products: updatedProducts });
      return { success: true, data: newProduct };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  },
  
  updateProduct: async (productId, updatedFields) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Find and update the product
      let updatedProduct = null;
      const updatedProducts = (currentData.products || []).map(product => {
        if (product.id === productId) {
          updatedProduct = { ...product, ...updatedFields };
          return updatedProduct;
        }
        return product;
      });
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, products: updatedProducts });
      return { success: true, data: updatedProduct };
    } catch (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
  },
  
  deleteProduct: async (productId) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Remove product
      const updatedProducts = (currentData.products || []).filter(product => product.id !== productId);
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, products: updatedProducts });
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  /*
   * CRUD operations for appointment types
   */
  addAppointmentType: async (newAppointmentType) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Generate a new ID if not provided
      if (!newAppointmentType.id) {
        const highestId = Math.max(...currentData.appointment_choices.map(choice => choice.id), 0);
        newAppointmentType.id = highestId + 1;
      }
      
      // Add new appointment type to the array
      const updatedChoices = [...currentData.appointment_choices, newAppointmentType];
      
      // Update the database
      const result = await databaseService._updateFormData(
        { ...currentData, appointment_choices: updatedChoices }
      );
      return { success: true, data: newAppointmentType };
    } catch (error) {
      console.error('Error adding appointment type:', error);
      return { success: false, error: error.message };
    }
  },
  
  updateAppointmentType: async (choiceId, updatedFields) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Find and update the appointment type
      const updatedChoices = currentData.appointment_choices.map(choice => 
        choice.id === choiceId ? { ...choice, ...updatedFields } : choice
      );
      
      // Update the database
      const result = await databaseService._updateFormData(
        { ...currentData, appointment_choices: updatedChoices }
      );
      return { success: true, data: updatedChoices.find(choice => choice.id === choiceId) };
    } catch (error) {
      console.error('Error updating appointment type:', error);
      return { success: false, error: error.message };
    }
  },
  
  deleteAppointmentType: async (choiceId) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Remove appointment type
      const updatedChoices = currentData.appointment_choices.filter(choice => choice.id !== choiceId);
      
      // Update the database
      const result = await databaseService._updateFormData(
        { ...currentData, appointment_choices: updatedChoices }
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment type:', error);
      return { success: false, error: error.message };
    }
  },

  /*
   * CRUD operations for events
   */
  addEvent: async (newEvent) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Ensure srs_id is provided as it's the primary identifier
      if (!newEvent.srs_id) {
        throw new Error('SRS ID is required for events');
      }
      
      // Add new event to the array
      const updatedEvents = [...(currentData.events || []), newEvent];
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, events: updatedEvents });
      return { success: true, data: newEvent };
    } catch (error) {
      console.error('Error adding event:', error);
      return { success: false, error: error.message };
    }
  },

  updateEvent: async (srsId, updatedFields) => {
    try {
      const currentData = await databaseService._getCurrentFormData();
      
      // Find and update the event
      let updatedEvent = null;
      const updatedEvents = (currentData.events || []).map(event => {
        if (event.srs_id === srsId) {
          updatedEvent = { ...event, ...updatedFields };
          return updatedEvent;
        }
        return event;
      });
      
      const result = await databaseService._updateFormData({ ...currentData, events: updatedEvents });
      return { success: true, data: updatedEvent };
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
  },

  deleteEvent: async (srsId) => {
    try {
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      
      // Remove event
      const updatedEvents = (currentData.events || []).filter(event => event.srs_id !== srsId);
      
      // Update the database
      const result = await databaseService._updateFormData({ ...currentData, events: updatedEvents });
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
  },

  /*
   * Bulk operations for events
   */
  bulkReplaceEvents: async (newEvents) => {
    try {
      console.log('bulkReplaceEvents: Starting with', newEvents.length, 'events');
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      console.log('bulkReplaceEvents: Got current data');
      
      // Validate new events structure
      // Replace all events with new events
      const result = await databaseService._updateFormData({ 
        ...currentData, 
        events: newEvents 
      });
      
      console.log('bulkReplaceEvents: _updateFormData result:', result);
      
      // _updateFormData returns the updated data directly, not a success object
      if (result) {
        return { 
          success: true, 
          message: `Successfully replaced all events with ${newEvents.length} new events` 
        };
      } else {
        return { success: false, error: 'Failed to update database' };
      }
    } catch (error) {
      console.error('Error bulk replacing events:', error);
      return { success: false, error: error.message };
    }
  },

  /*
   * Bulk operations for staff
   */
  bulkReplaceStaffs: async (newStaffs) => {
    try {
      console.log('bulkReplaceStaffs: Starting with', newStaffs.length, 'staff');
      // Get current data
      const currentData = await databaseService._getCurrentFormData();
      console.log('bulkReplaceStaffs: Got current data');
      
      // Replace all staffs with new staffs
      const result = await databaseService._updateFormData({ 
        ...currentData, 
        staffs: newStaffs 
      });
      
      console.log('bulkReplaceStaffs: _updateFormData result:', result);
      
      // _updateFormData returns the updated data directly, not a success object
      if (result) {
        return { 
          success: true, 
          message: `Successfully replaced all staff with ${newStaffs.length} new staff members` 
        };
      } else {
        return { success: false, error: 'Failed to update database' };
      }
    } catch (error) {
      console.error('Error bulk replacing staff:', error);
      return { success: false, error: error.message };
    }
  }
};

export default databaseService;
