import { createContext, useState, useContext, useEffect } from 'react';
import { getAuthToken, addLead, formatAppointmentForLeadPerfection } from '../services/leadPerfectionService';

// Initial form data structure
const initialFormData = {
  fullName: '',
  spouse: '',
  address1: '',
  zip: '',
  phone: '',
  email: '',
  staff: null,
  event: null,
  product: null, // Changed from products array to single product
  date: '',
  time: '', // Military time format
  timeSlotId: '', // Slot identifier (X1-X4) from LeadPerfection
  sweepstakesOnly: false, // Option for bypassing date/time selection
};

// Create context
const AppContext = createContext(undefined);

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  
  return context;
}

// Provider component
export function AppProvider({ children }) {
  // Form data state
  const [formData, setFormData] = useState(initialFormData);

  // Log formData whenever it changes
  useEffect(() => {
    console.log('Form Data Updated:', formData);
  }, [formData]);

  // Update specific form fields
  const updateFormField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Update multiple form fields at once
  const updateFormFields = (fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields
    }));
  };

  // Reset the form
  const resetForm = () => {
    setFormData(initialFormData);
  };

  // Submit the form and send to LeadPerfection API only
  const submitForm = async () => {
    console.log('Form submitted:', formData);
    
    try {
      // Get LeadPerfection token
      console.log('Getting LeadPerfection token...');
      const token = await getAuthToken();
      
      // Format appointment data for LeadPerfection
      console.log('Form data before formatting:', formData);
      const leadData = formatAppointmentForLeadPerfection(formData);
      console.log('Formatted lead data:', leadData);
      
      // Send to LeadPerfection (including sweepstakes entries)
      console.log('Sending appointment to LeadPerfection...');
      const leadResult = await addLead(token, leadData);
      console.log('Lead added to LeadPerfection:', leadResult);
      
      return { 
        success: true, 
        formData, 
        leadResult 
      };
      
    } catch (error) {
      console.error('Error submitting form to LeadPerfection:', error);
      
      return { 
        success: false, 
        error: error.message || 'Failed to submit appointment to LeadPerfection' 
      };
    }
  };

  // Context value
  const contextValue = {
    formData,
    updateFormField,
    updateFormFields,
    resetForm,
    submitForm
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
