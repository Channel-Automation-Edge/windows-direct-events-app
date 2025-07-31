import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

// Import step components
import Step1PersonalInfo from '../components/appointment/Step1PersonalInfo';
import Step2Products from '../components/appointment/Step2Products';
import Step3DateTime from '../components/appointment/Step3DateTime';
import SuccessDialog from '../components/ui/SuccessDialog';

const NewAppointment = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { submitForm, resetForm } = useAppContext();
  const navigate = useNavigate();
  
  // Only reset form on successful form submission
  // Remove the cleanup function to prevent resetting between steps
  
  const steps = [
    { id: 1, name: 'Personal Information' },
    { id: 2, name: 'Product Selection' },
    { id: 3, name: 'Date & Time' },
  ];

  const handleNext = () => {
    console.log('NewAppointment: handleNext called, current step:', currentStep);
    if (currentStep < steps.length) {
      console.log('NewAppointment: Advancing to step', currentStep + 1);
      // Use direct setState instead of callback to ensure component re-renders
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      console.log('NewAppointment: Step updated to', nextStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleSubmit = async () => {
    try {
      const result = await submitForm();
      if (result.success) {
        // Show success dialog after successful submission
        console.log('NewAppointment: Form submitted successfully');
        setShowSuccessDialog(true);
      } else {
        console.error('Form submission failed');
        // Handle error state
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Navigate to home and reset form after dialog is closed
    navigate('/');
    setTimeout(() => {
      resetForm();
      console.log('Form data has been reset');
    }, 100);
  };

  // Render the current step component based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo onNext={handleNext} />;
      case 2:
        return <Step2Products onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <Step3DateTime onNext={handleSubmit} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:py-8">
      <h1 className="text-2xl font-bold mb-6">Schedule an Appointment</h1>
      
      {/* Step indicator */}
      <div className="mb-8">
        <h2 className="sr-only">Steps</h2>

        <div
          className="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-gray-100"
        >
          <ol className="relative z-10 flex justify-between text-sm font-medium text-gray-500">
            {steps.map((step) => (
              <li key={step.id} className="flex items-center gap-2 p-2">
                <span
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-center font-medium text-xs",
                    currentStep === step.id
                      ? "bg-brand text-white"
                      : currentStep > step.id
                        ? "bg-[#1423a2] text-white"
                        : "bg-gray-100"
                  )}
                >
                  {step.id}
                </span>

                <span className="hidden sm:block bg-gray-50">{step.name}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Main form content */}
      <div className="bg-white shadow-md rounded-lg p-6">
        {renderStepContent()}
      </div>
      
      {/* Success Dialog */}
      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title="Appointment Submitted!"
        message="Thank you! Your appointment request has been successfully submitted."
        buttonText="Okay"
      />
    </div>
  );
};

export default NewAppointment;
