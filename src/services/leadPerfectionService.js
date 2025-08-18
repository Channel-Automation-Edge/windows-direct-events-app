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

// Base URL for API - use Netlify functions in all environments
const BASE_URL = '/.netlify/functions';

// Time slot mapping from identifiers (X1-X4) to military time
export const TIME_SLOT_MAPPING = {
  X1: '09:00', // 9AM 
  X2: '10:00', // 10AM
  X3: '14:00', // 2PM
  X4: '18:00'  // 6PM
};

// Time slot display labels
export const TIME_SLOT_LABELS = {
  X1: '9:00 AM', 
  X2: '10:00 AM',
  X3: '2:00 PM',
  X4: '6:00 PM'
};

// Get authentication token
export const getAuthToken = async () => {
  try {
    const endpoint = `${BASE_URL}/leadperfection-token`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
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
    
    const endpoint = `${BASE_URL}/leadperfection-lookup`;
    
    // Prepare lookup data for Netlify function
    const lookupData = {};
    if (zipCode) lookupData.zip = zipCode;
    if (productId) lookupData.productid = productId;
    if (branchId) lookupData.branchid = branchId;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, lookupData })
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
    
    const endpoint = `${BASE_URL}/leadperfection-add`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, leadData })
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
  console.log('formatAppointmentForLeadPerfection - formData.staff:', formData.staff);
  
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
  
  const payload = {
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
    pro_id: formData.staff?.id ? parseInt(formData.staff.id, 10) : 0,
    apptdate,
    appttime,
    sender: 'Channel Automation'
  };

  // Handle notes and srs_id based on submission type
  if (formData.sweepstakesOnly) {
    // Sweepstakes entry: set notes to 'sweepstakes' and override srs_id to 329
    payload.notes = 'sweepstakes';
    payload.srs_id = '329';
  } else if (formData.date && formData.time) {
    // Appointment scheduled: set notes to 'Set By ChannelAutomation'
    payload.notes = 'Set By ChannelAutomation';
  }

  return payload;
};
