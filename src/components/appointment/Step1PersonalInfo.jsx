import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, Users, Home, MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { useDataContext } from '../../context/DataContext';

const Step1ValidationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  spouse: Yup.string(), // Optional
  address1: Yup.string().required('Street address is required'),
  zip: Yup.string().required('Zip code is required'),
  phone: Yup.string().required('Phone number is required')
    .matches(
      /^[\d\s\-+()]*$/,
      'Please enter a valid phone number'
    ),
  email: Yup.string().email('Invalid email format'),
  staff: Yup.string().required('Please select who helped you'),
  event: Yup.string().required('Please select an event')
});

const Step1PersonalInfo = ({ onNext }) => {
  const { formData, updateFormField, updateFormFields } = useAppContext();
  const { staffs, activeEvents, events, loading, error, refreshData } = useDataContext();
  const [dataFetched, setDataFetched] = useState(false);
  
  useEffect(() => {
    if (!dataFetched) {
      console.log('Step1: Fetching data once on mount');
      refreshData();
      setDataFetched(true);
    }
  }, [dataFetched, refreshData]);

  const handleSubmit = (values) => {
    // Convert string IDs back to objects
    const processedValues = {...values};
    
    // Convert staff ID to staff object
    if (values.staff) {
      const staffId = values.staff.toString();
      const staffObject = staffs.find(staff => staff.id === staffId);
      processedValues.staff = staffObject;
    }
    
    // Convert event ID to event object
    if (values.event) {
      const eventId = values.event;
      // First try to find in activeEvents, if not found check all events
      let eventObject = activeEvents.find(event => event.srs_id === eventId);
      if (!eventObject) {
        eventObject = events.find(event => event.srs_id === eventId);
      }
      processedValues.event = eventObject;
    }
    
    // Update all form fields at once
    updateFormFields(processedValues);
    
    // Proceed to next step
    onNext();
  };

  return (
    <Formik
      initialValues={{
        fullName: formData.fullName || '',
        spouse: formData.spouse || '',
        address1: formData.address1 || '',
        zip: formData.zip || '',
        phone: formData.phone || '',
        email: formData.email || '',
        staff: formData.staff ? formData.staff.id : '',
        event: formData.event ? formData.event.srs_id : ''
      }}
      validationSchema={Step1ValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange: formikHandleChange, handleBlur, setFieldValue }) => {
        // Custom handler to update both Formik and AppContext
        const handleChange = (e) => {
          const { name, value } = e.target;
          formikHandleChange(e); // Update Formik state
          updateFormField(name, value); // Update AppContext
        };
        
        return (
          <Form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <User size={16} /> First & Last Name *
                </label>
                <Field
                  type="text"
                  id="fullName"
                  name="fullName"
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                    errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="fullName" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="spouse" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Users size={16} /> Spouse/Significant Other
                </label>
                <Field
                  type="text"
                  id="spouse"
                  name="spouse"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand focus:border-brand"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="address1" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Home size={16} /> Street Address *
              </label>
              <Field
                type="text"
                id="address1"
                name="address1"
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                  errors.address1 && touched.address1 ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <ErrorMessage name="address1" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div>
              <label htmlFor="zip" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin size={16} /> Zip Code *
              </label>
              <Field
                type="text"
                id="zip"
                name="zip"
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                  errors.zip && touched.zip ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <ErrorMessage name="zip" component="div" className="text-red-500 text-sm mt-1" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone size={16} /> Phone Number *
                </label>
                <Field
                  type="tel"
                  id="phone"
                  name="phone"
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                    errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
              </div>
              
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Mail size={16} /> Email
                </label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
              </div>
            </div>

            <div>
              <label htmlFor="staff" className="block text-sm font-medium text-gray-700 mb-1">
                Who helped you get set up today? *
              </label>
              <Field
                as="select"
                id="staff"
                name="staff"
                className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                  errors.staff && touched.staff ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedStaff = staffs.find(staff => staff.id === selectedId);
                  setFieldValue('staff', selectedId); // Update Formik with ID
                  updateFormField('staff', selectedStaff); // Update AppContext with full object
                }}
                disabled={loading}
              >
                <option value="">Select staff member</option>
                {staffs.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="staff" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                Event *
              </label>
              <Field
                as="select"
                id="event"
                name="event"
                className={`w-full px-4 py-2 border rounded-md focus:ring-brand focus:border-brand ${
                  errors.event && touched.event ? 'border-red-500' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedEvent = activeEvents.find(event => event.srs_id === selectedId);
                  setFieldValue('event', selectedId); // Update Formik with ID
                  updateFormField('event', selectedEvent); // Update AppContext with full object
                }}
                disabled={loading}
              >
                <option value="">Select event</option>
                {activeEvents.map(event => (
                    <option key={event.srs_id} value={event.srs_id}>
                      {event.name}
                    </option>
                  ))}
              </Field>
              <ErrorMessage name="event" component="div" className="text-red-500 text-sm mt-1" />
            </div>

            <div className="mt-6">
              <Button type="submit" className="w-full gap-2">
                Next
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default Step1PersonalInfo;
