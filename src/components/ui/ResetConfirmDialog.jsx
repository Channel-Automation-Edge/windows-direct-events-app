import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

const ResetConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Reset Form",
  message = "Are you sure you want to reset the form? All entered information will be lost.",
  isResetting = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isResetting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 mb-4">
            {message}
          </p>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mb-4">
            <p className="text-sm text-orange-700">
              <strong>Warning:</strong> This will clear all form data and return you to step 1.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isResetting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isResetting}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isResetting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Resetting...
              </span>
            ) : (
              'Reset Form'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmDialog;
