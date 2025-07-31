// LeadPerfection API Service
// Handles authentication and data fetching from LeadPerfection API

// API credentials
const API_CREDENTIALS = {
  grant_type: 'password',
  username: 'ChannelAutomation',
  password: 'ChannelAutomation',
  clientid: 'wq55a',
  appkey: import.meta.env.VITE_LEAD_PERFECTION_APP_KEY
};

// Base URL for API - using proxy to avoid CORS issues
const BASE_URL = '/api/leadperfection';

// Time slot mapping from identifiers (X1-X4) to military time
export const TIME_SLOT_MAPPING = {
  X1: '09:00', // 9AM 
  X2: '11:00', // 11AM
  X3: '14:00', // 2PM
  X4: '18:00'  // 6PM
};

// Time slot display labels
export const TIME_SLOT_LABELS = {
  X1: '9:00 AM', 
  X2: '11:00 AM',
  X3: '2:00 PM',
  X4: '6:00 PM'
};

// Get authentication token
export const getAuthToken = async () => {
  try {
    const formData = new URLSearchParams();
    
    // Add credentials to form data
    Object.entries(API_CREDENTIALS).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const response = await fetch(`${BASE_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
};

// Get forward look data for available time slots
export const getForwardLookData = async (token, zipCode, productId = null, branchId = null) => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }
    
    const formData = new URLSearchParams();
    if (zipCode) formData.append('zip', zipCode);
    if (productId) formData.append('productid', productId);
    if (branchId) formData.append('branchid', branchId);
    
    const response = await fetch(`${BASE_URL}/api/Leads/GetLeadsForwardLook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get time slots: ${response.status}`);
    }
    
    const data = await response.json();
    return processForwardLookData(data);
  } catch (error) {
    console.error('Error getting forward look data:', error);
    throw error;
  }
};

// Process the forward look data to extract available dates and time slots
const processForwardLookData = (data) => {
  if (!data || !Array.isArray(data)) {
    console.log('No data or invalid data format received from API');
    return { availableDates: [], availableSlots: {} };
  }
  
  console.log('Processing forward look data:', data.length, 'date entries');
  
  const availableDates = [];
  const availableSlots = {};
  
  // Process each date in the response
  data.forEach((dateData, index) => {
    const date = dateData.SDate;
    const formattedDate = formatDateString(date); // Convert to YYYY-MM-DD
    
    // Skip if date formatting failed
    if (!formattedDate) {
      console.warn(`Skipping entry ${index} due to invalid date:`, date);
      return;
    }
    
    // Check for available slots (X values)
    const availableSlotsForDate = [];
    
    // Check X1-X4 values (ignore X5-X6)
    for (let i = 1; i <= 4; i++) {
      const slotKey = `X${i}`;
      const slotValue = dateData[slotKey];
      
      // If slot value is greater than 0, it's available
      if (slotValue > 0) {
        availableSlotsForDate.push(slotKey);
      }
    }
    
    // Only add dates with available slots
    if (availableSlotsForDate.length > 0) {
      availableDates.push(formattedDate);
      availableSlots[formattedDate] = availableSlotsForDate;
      console.log(`Date ${formattedDate}: Available slots:`, availableSlotsForDate);
    } else {
      console.log(`Date ${formattedDate}: No available slots`);
    }
  });
  
  return {
    availableDates,
    availableSlots
  };
};

// Helper to format date string from ISO format to YYYY-MM-DD
const formatDateString = (dateStr) => {
  try {
    // Handle ISO format like "2025-07-30T00:00:00"
    if (dateStr.includes('T')) {
      // Parse ISO date and extract just the date part
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error('Invalid date format:', dateStr);
        return null;
      }
      
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    }
    
    // Fallback: try to parse MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    
    // If already in YYYY-MM-DD format, return as-is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    
    console.error('Unrecognized date format:', dateStr);
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

// Add a lead to LeadPerfection
export const addLead = async (token, leadData) => {
  try {
    console.log('Adding lead to LeadPerfection:', leadData);
    
    // Create form data for the API request
    const formData = new URLSearchParams();
    
    // Add all the required fields
    if (leadData.firstname) formData.append('firstname', leadData.firstname);
    if (leadData.lastname) formData.append('lastname', leadData.lastname);
    if (leadData.address1) formData.append('address1', leadData.address1);
    if (leadData.address2) formData.append('address2', leadData.address2);
    if (leadData.city) formData.append('city', leadData.city);
    if (leadData.state) formData.append('state', leadData.state);
    if (leadData.zip) formData.append('zip', leadData.zip);
    if (leadData.phone) formData.append('phone', leadData.phone);
    if (leadData.productID) formData.append('productID', leadData.productID);
    if (leadData.email) formData.append('email', leadData.email);
    if (leadData.srs_id) formData.append('srs_id', leadData.srs_id);
    if (leadData.pro_id) formData.append('pro_id', leadData.pro_id);
    if (leadData.apptdate) formData.append('apptdate', leadData.apptdate);
    if (leadData.appttime) formData.append('appttime', leadData.appttime);
    
    const response = await fetch(`${BASE_URL}/api/Leads/LeadAdd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add lead: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Lead added successfully:', result);
    return result;
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
};

// Helper function to format appointment data for LeadPerfection
export const formatAppointmentForLeadPerfection = (formData) => {
  // Parse the full name into first and last name
  const nameParts = (formData.fullName || '').trim().split(' ');
  const firstname = nameParts[0] || '';
  const lastname = nameParts.slice(1).join(' ') || '';
  
  // Format the appointment date to MM/DD/YYYY
  let apptdate = '';
  if (formData.date) {
    try {
      const date = new Date(formData.date);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      apptdate = `${month}/${day}/${year}`;
    } catch (error) {
      console.error('Error formatting appointment date:', error);
    }
  }
  
  // Format the appointment time
  let appttime = '';
  if (formData.time) {
    try {
      // Convert military time (e.g., "14:00") to standard format (e.g., "2:00 PM")
      const [hours, minutes] = formData.time.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      appttime = `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting appointment time:', error);
    }
  }
  
  return {
    firstname,
    lastname,
    address1: formData.address1 || '',
    address2: '', // Not collected in our form
    city: '', // Not collected in our form
    state: '', // Not collected in our form
    zip: formData.zip || '',
    phone: formData.phone || '',
    productID: formData.product?.id || '',
    email: formData.email || '',
    srs_id: formData.event?.srs_id || '',
    pro_id: formData.staff?.id || '',
    apptdate,
    appttime
  };
};
