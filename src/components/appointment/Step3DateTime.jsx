import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { useDataContext } from '../../context/DataContext';
import { format, parse, isValid, addDays, startOfDay } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { databaseService } from '../../services/databaseService';

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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(formData.time || '');
  const [consentChecked, setConsentChecked] = useState(false);
  const [skipAppointment, setSkipAppointment] = useState(formData.skipAppointment || false);
  
  // State for time slots from database
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState({});
  const [error, setError] = useState(null);
  
  // Fetch time slots from database on component mount
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (skipAppointment) return; // Skip if not scheduling appointment
      
      try {
        setLoading(true);
        setError(null);
        const formData = await databaseService.getFormData();
        
        if (formData?.time_slots) {
          setTimeSlots(formData.time_slots);
        } else {
          setError('No time slots available. Please contact customer service.');
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Failed to load available time slots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimeSlots();
  }, [skipAppointment]);

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
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    updateFormField('time', timeSlot);
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
  
  // Handle skip appointment toggle
  const handleSkipAppointmentChange = (isSkipping) => {
    setSkipAppointment(isSkipping);
    updateFormField('skipAppointment', isSkipping);
    
    // If skipping appointment, clear date and time
    if (isSkipping) {
      setSelectedDate(null);
      setSelectedTimeSlot('');
      updateFormField('date', '');
      updateFormField('time', '');
    } else {
      // If scheduling appointment, fetch the time slots from database
      const fetchTimeSlots = async () => {
        try {
          setLoading(true);
          setError(null);
          const formData = await databaseService.getFormData();
          
          if (formData?.time_slots) {
            setTimeSlots(formData.time_slots);
          } else {
            setError('No time slots available. Please contact customer service.');
          }
        } catch (error) {
          console.error('Error fetching time slots:', error);
          setError('Failed to load available time slots. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchTimeSlots();
    }
  };
  
  // Validate based on whether appointment is being scheduled
  const handleNext = () => {
    if (skipAppointment) {
      if (consentChecked) {
        onNext();
      }
    } else {
      // If scheduling appointment, we need date, time slot, and consent
      if (selectedDate && selectedTimeSlot && consentChecked) {
        updateFormField('time', selectedTimeSlot);
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <h2 className="text-xl font-semibold mb-4">Appointment Scheduling</h2>
      
      {/* Appointment Options */}
      <div className="mb-6">
        <p className="text-gray-700 mb-4">Would you like to schedule an appointment or enter our sweepstakes?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleSkipAppointmentChange(false)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              !skipAppointment
                ? 'border-brand bg-brand/5 text-brand'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                !skipAppointment ? 'border-brand bg-brand' : 'border-gray-300'
              }`}>
                {!skipAppointment && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div>
                <h3 className="font-medium">Schedule Appointment</h3>
                <p className="text-sm text-gray-600">Book a consultation with our team</p>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleSkipAppointmentChange(true)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${
              skipAppointment
                ? 'border-brand bg-brand/5 text-brand'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                skipAppointment ? 'border-brand bg-brand' : 'border-gray-300'
              }`}>
                {skipAppointment && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div>
                <h3 className="font-medium">Enter Sweepstakes</h3>
                <p className="text-sm text-gray-600">Skip appointment and enter to win</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      {/* Show appointment scheduling or sweepstakes message */}
      {skipAppointment ? (
        <div className="text-center py-6">
          <div className="bg-brand/10 p-4 rounded-lg border border-brand/20">
            <h3 className="text-brand text-lg font-medium">🎉 Sweepstakes Entry</h3>
            <p className="text-brand/80 mt-1">
              You're entered to win! We'll contact you if you're selected as a winner.
              You can always schedule an appointment later by contacting us directly.
              Click Submit below to complete your entry.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
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
                <div className="w-full max-w-sm mx-auto border rounded-xl border-gray-200 shadow-sm">

                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  disabled={(date) => {
                    // Disable past dates and weekends if no time slots available
                    const today = startOfDay(new Date());
                    if (date < today) return true;
                    
                    const dayName = format(date, 'EEEE');
                    const slotsForDay = timeSlots[dayName] || [];
                    return slotsForDay.length === 0;
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
                const dayName = format(selectedDate, 'EEEE');
                const slotsForDay = timeSlots[dayName] || [];
                
                return slotsForDay.length > 0 ? (
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 max-w-md mx-auto">
                    {slotsForDay.map((timeSlot) => (
                      <button
                        key={timeSlot}
                        type="button"
                        className={`py-3 px-4 text-sm font-medium rounded-md border transition-all ${
                          selectedTimeSlot === timeSlot 
                            ? 'bg-brand text-white border-brand hover:bg-brand/90' 
                            : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleTimeSlotSelect(timeSlot)}
                      >
                        {convertTo12HourFormat(timeSlot)}
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
                {Object.keys(timeSlots).length > 0 ? 
                  "Please select an available date to view time slots." : 
                  "No available appointment dates found. Please try again later or contact customer service."}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Consent Checkbox */}
      <div className="mt-6 p-4 mx-2 sm:mx-0">
        <div className="flex items-start gap-3">
          <div className="flex h-5 items-center flex-shrink-0">
            <input
              type="checkbox"
              id="marketing-consent"
              checked={consentChecked}
              onChange={handleConsentChange}
              className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand focus:ring-offset-0"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-600 leading-relaxed">
              By checking this box, I authorize this company to send me marketing calls and text messages at the number provided above, including by using an autodialer or a prerecorded message. I understand that I am not required to give this authorization as a condition of doing business with this company. By checking this box, I am also agreeing to the company's Terms of Use and Privacy Policy.
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
          disabled={(skipAppointment ? !consentChecked : (!selectedDate || !selectedTimeSlot || !consentChecked))}
          className={`gap-2 ${(skipAppointment ? !consentChecked : (!selectedDate || !selectedTimeSlot || !consentChecked)) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default Step3DateTime;
