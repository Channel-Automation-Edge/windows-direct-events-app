import { CheckCircle2, X } from 'lucide-react';
import { Button } from './Button';

const SuccessDialog = ({ 
  isOpen, 
  onClose, 
  title = "Success!",
  message = "Your appointment has been successfully submitted.",
  buttonText = "Okay"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">
            {message}
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>What's next?</strong> You will receive a confirmation call or email with your appointment details shortly.
            </p>
          </div>
        </div>

        <div className="flex justify-center p-4 border-t bg-gray-50">
          <Button
            onClick={onClose}
            className="px-8"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessDialog;
