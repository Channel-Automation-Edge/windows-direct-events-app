import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { useDataContext } from '../../context/DataContext';
import { format, parse, isValid } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { getAuthToken, getForwardLookData, TIME_SLOT_MAPPING, TIME_SLOT_LABELS } from '../../services/leadPerfectionService';

const Step3DateTime = ({ onNext, onBack }) => {
  const { formData, updateFormField } = useAppContext();
  
  // Helper function to parse date string to Date object
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    return isValid(parsedDate) ? parsedDate : null;
  };
  
  // State for calendar and time slots
  const [selectedDate, setSelectedDate] = useState(formData.date ? parseDate(formData.date) : null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(formData.timeSlotId || '');
  const [consentChecked, setConsentChecked] = useState(false);
  const [sweepstakesOnly, setSweepstakesOnly] = useState(formData.sweepstakesOnly || false);
  
  // State for API data
  const [loading, setLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [apiError, setApiError] = useState(null);
  
  // Fetch authentication token on component mount
  useEffect(() => {
    const fetchAuthToken = async () => {
      if (sweepstakesOnly) return; // Skip API calls if sweepstakes only
      
      try {
        setLoading(true);
        setApiError(null);
        const token = await getAuthToken();
        setAuthToken(token);
        
        // After getting token, fetch available time slots
        fetchAvailableSlots(token);
      } catch (error) {
        console.error('Error authenticating with LeadPerfection:', error);
        setApiError('Failed to connect to appointment scheduling service. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAuthToken();
  }, [sweepstakesOnly]);
  
  // Function to fetch available time slots using the token
  const fetchAvailableSlots = async (token) => {
    try {
      // Get user's zip code from form data
      const zipCode = formData.zip || '';
      
      // Get product ID if available (optional)
      const productId = formData.product?.id || null;
      
      // Fetch forward look data
      const forwardLookData = await getForwardLookData(token, zipCode, productId);
      
      setAvailableDates(forwardLookData.availableDates);
      setAvailableSlots(forwardLookData.availableSlots);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      setApiError('Failed to retrieve available appointment times. Please try again later.');
      setLoading(false);
    }
  };

  // Update time slots when date changes
  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      
      // Format the date for storage in YYYY-MM-DD format
      const formattedDate = format(date, 'yyyy-MM-dd');
      updateFormField('date', formattedDate);
      
      // Clear selected time slot when date changes
      setSelectedTimeSlot('');
      updateFormField('time', '');
      updateFormField('timeSlotId', '');
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slotId) => {
    setSelectedTimeSlot(slotId);
    
    // Store both the slot ID and the military time
    updateFormField('timeSlotId', slotId);
    updateFormField('time', TIME_SLOT_MAPPING[slotId]);
  };
  
  // Function to convert 24-hour time to 12-hour time format
  const convertTo12HourFormat = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':');
    const parsedHour = parseInt(hour, 10);
    const suffix = parsedHour >= 12 ? 'PM' : 'AM';
    const twelveHour = parsedHour % 12 || 12;
    return `${twelveHour}:${minute} ${suffix}`;
  };
  
  // Handle consent checkbox change
  const handleConsentChange = (e) => {
    setConsentChecked(e.target.checked);
  };
  
  // Handle sweepstakes only toggle
  const handleSweepstakesChange = (e) => {
    const isChecked = e.target.checked;
    setSweepstakesOnly(isChecked);
    updateFormField('sweepstakesOnly', isChecked);
    
    // If toggling on sweepstakes only, clear date and time
    if (isChecked) {
      setSelectedDate(null);
      setSelectedTimeSlot('');
      updateFormField('date', '');
      updateFormField('time', '');
      updateFormField('timeSlotId', '');
    } else {
      // If turning off sweepstakes, fetch the time slots if we have a token
      if (authToken) {
        fetchAvailableSlots(authToken);
      } else {
        // Re-initialize the auth process if needed
        const fetchAuthToken = async () => {
          try {
            setLoading(true);
            setApiError(null);
            const token = await getAuthToken();
            setAuthToken(token);
            fetchAvailableSlots(token);
          } catch (error) {
            console.error('Error authenticating with LeadPerfection:', error);
            setApiError('Failed to connect to appointment scheduling service.');
            setLoading(false);
          }
        };
        
        fetchAuthToken();
      }
    }
  };
  
  // Validate based on whether sweepstakesOnly is enabled
  const handleNext = () => {
    if (sweepstakesOnly) {
      if (consentChecked) {
        onNext();
      }
    } else {
      // Otherwise we need date, time slot ID, and consent
      if (selectedDate && selectedTimeSlot && consentChecked) {
        // Ensure both timeSlotId and time are set properly
        updateFormField('timeSlotId', selectedTimeSlot);
        updateFormField('time', TIME_SLOT_MAPPING[selectedTimeSlot]);
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Date and Time Selection</h2>
      
      {/* Sweepstakes Only Toggle */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              id="sweepstakes-only"
              checked={sweepstakesOnly}
              onChange={handleSweepstakesChange}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand focus:ring-offset-0"
            />
          </div>
          <div>
            <label htmlFor="sweepstakes-only" className="font-medium text-gray-800">
              Sweepstakes Entry Only
            </label>
            <p className="text-sm text-gray-600">
              Check this box if you're only interested in entering the sweepstakes without scheduling an appointment.
            </p>
          </div>
        </div>
      </div>
      
      {/* Show appointment scheduling or sweepstakes message based on sweepstakesOnly toggle */}
      {sweepstakesOnly ? (
        <div className="text-center py-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-green-800 text-lg font-medium">Sweepstakes Entry Only</h3>
            <p className="text-green-700 mt-1">
              You've opted for sweepstakes entry without scheduling an appointment.
              Click Submit below to continue.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* API Error Message */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">{apiError}</p>
            </div>
          )}
          
          {/* Date Selection Section */}
          <div>
            <h3 className="text-center font-medium mb-4">Select a date</h3>
            <div className="flex justify-center">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading available appointment times...</p>
                </div>
              ) : (
                <div className="w-full mx-24 lg:mx-36 border rounded-xl border-gray-200  shadow-sm">

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  disabled={(date) => {
                    // Disable dates not returned by the API
                    const formattedDate = format(date, 'yyyy-MM-dd');
                    return !availableDates.includes(formattedDate);
                  }}
                  initialFocus
                  className="rounded-xl"
                />
                </div>
              )}
              
            </div>
          </div>
          
          {/* Time Selection Section */}
          <div className="mt-8">
            <h3 className="text-center font-medium mb-4">Select a time</h3>
            
            {selectedDate ? (
              // Check if we have time slots for the selected date
              (() => {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                const slotsForDate = availableSlots[formattedDate] || [];
                
                return slotsForDate.length > 0 ? (
                  <div className="flex flex-wrap justify-center gap-3">
                    {slotsForDate.map((slotId) => (
                      <button
                        key={slotId}
                        type="button"
                        className={`py-2 px-4 w-28 text-sm font-medium rounded-md border transition-all ${
                          selectedTimeSlot === slotId 
                            ? 'bg-brand text-white border-brand hover:bg-brand/90' 
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTimeSlotSelect(slotId)}
                      >
                        {TIME_SLOT_LABELS[slotId]}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-600 py-4">
                    No time slots available for the selected date.
                  </div>
                );
              })()
            ) : (
              <div className="text-center text-gray-600 py-4">
                {availableDates.length > 0 ? 
                  "Please select an available date to view time slots." : 
                  "No available appointment dates found. Please try again later or contact customer service."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Consent Checkbox */}
      <div className="mt-6 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              id="marketing-consent"
              checked={consentChecked}
              onChange={handleConsentChange}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand focus:ring-offset-0"
            />
          </div>
          <div>
            <p className="text-sm text-gray-600">
              By checking this box, I authorize Windows Direct USA to send me marketing calls and text messages at the number provided above, including by using an autodialer or a prerecorded message. I understand that I am not required to give this authorization as a condition of doing business with Windows Direct USA. By checking this box, I am also agreeing to Windows Direct USA's Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button 
          variant="secondary"
          onClick={onBack}
          className="gap-2"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={(sweepstakesOnly ? !consentChecked : (!selectedDate || !selectedTimeSlot || !consentChecked))}
          className={`gap-2 ${(sweepstakesOnly ? !consentChecked : (!selectedDate || !selectedTimeSlot || !consentChecked)) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Step3DateTime;
