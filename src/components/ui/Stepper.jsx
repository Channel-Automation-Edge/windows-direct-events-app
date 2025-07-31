import React from 'react';
import { cn } from '@/lib/utils';

const Stepper = ({ currentStep }) => {
  const steps = [
    { id: 1, name: 'Personal Info' },
    { id: 2, name: 'Products' },
    { id: 3, name: 'Date & Time' }
  ];

  return (
    <div>
      <h2 className="sr-only">Steps</h2>

      <div
        className="relative after:absolute after:inset-x-0 after:top-1/2 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-gray-100"
      >
        <ol className="relative z-10 flex justify-between text-sm font-medium text-gray-500">
          {steps.map((step) => (
            <li key={step.id} className="flex items-center gap-2 bg-white p-2">
              <span 
                className={cn(
                  "size-6 rounded-full text-center text-[10px]/6 font-bold",
                  currentStep === step.id 
                    ? "bg-brand text-white" 
                    : currentStep > step.id 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-100"
                )}
              >
                {step.id}
              </span>

              <span className="hidden sm:block">{step.name}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Stepper;
