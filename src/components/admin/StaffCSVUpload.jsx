import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const StaffCSVUpload = ({ onUpload, loading = false }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);

  // Parse CSV content and extract staff
  const parseCSV = (csvContent) => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must contain headers and at least one data row');
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Find required column indices
      const idIndex = headers.findIndex(h => h.toLowerCase() === 'id');
      const firstNameIndex = headers.findIndex(h => h.toLowerCase() === 'firstname');
      const activeIndex = headers.findIndex(h => h.toLowerCase() === 'active');
      const salesRepIndex = headers.findIndex(h => h.toLowerCase() === 'salesrep');

      if (idIndex === -1 || firstNameIndex === -1 || activeIndex === -1 || salesRepIndex === -1) {
        throw new Error('CSV must contain columns: id, FirstName, Active, SalesRep');
      }

      // Parse data rows
      const staffData = [];
      const skippedRows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        
        if (row.length < headers.length) {
          skippedRows.push(`Row ${i + 1}: Insufficient columns`);
          continue;
        }

        const id = row[idIndex];
        const firstName = row[firstNameIndex];
        const active = row[activeIndex];
        const salesRep = row[salesRepIndex];

        // Filter: only include if Active = TRUE and SalesRep = TRUE
        if (active.toUpperCase() === 'TRUE' && salesRep.toUpperCase() === 'TRUE') {
          // Validate required fields
          if (!id || !firstName) {
            skippedRows.push(`Row ${i + 1}: Missing required fields (id or FirstName)`);
            continue;
          }

          staffData.push({
            id: id,
            name: firstName, // Map FirstName to name
            active: true
          });
        } else {
          skippedRows.push(`Row ${i + 1}: ${firstName || 'Unknown'} (Active=${active}, SalesRep=${salesRep})`);
        }
      }

      if (staffData.length === 0) {
        throw new Error('No valid staff found. Make sure Active=TRUE and SalesRep=TRUE for staff to be imported.');
      }

      return {
        success: true,
        data: staffData,
        totalRows: lines.length - 1,
        validRows: staffData.length,
        skippedRows: skippedRows
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  };

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParseResult(null);

    // Read and parse the file
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target.result;
      const result = parseCSV(csvContent);
      
      if (result.success) {
        setParseResult(result);
        setError(null);
      } else {
        setError(result.error);
        setParseResult(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Handle upload
  const handleUpload = () => {
    if (parseResult && parseResult.data) {
      onUpload(parseResult.data, resetComponent);
    }
  };

  // Reset component
  const resetComponent = () => {
    setFile(null);
    setParseResult(null);
    setError(null);
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-orange-400 bg-orange-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">
          Drag and drop your CSV file here, or click to select
        </p>
        <p className="text-sm text-gray-500 mb-4">
          CSV must contain: id, FirstName, Active, SalesRep columns
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          id={`staff-csv-upload-${Date.now()}`}
          ref={(input) => {
            if (input) {
              const label = input.nextElementSibling;
              if (label) label.setAttribute('htmlFor', input.id);
            }
          }}
        />
        <label>
          <Button 
            variant="outline" 
            className="cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              const input = e.target.closest('label').previousElementSibling;
              if (input) input.click();
            }}
          >
            Select CSV File
          </Button>
        </label>
      </div>

      {/* File Info */}
      {file && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium">Selected file: {file.name}</p>
          <p className="text-xs text-gray-500">Size: {(file.size / 1024).toFixed(1)} KB</p>
        </div>
      )}

      {/* Parse Results */}
      {parseResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">CSV Parsed Successfully</h4>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Total rows processed: {parseResult.totalRows}</p>
            <p>• Valid staff found: {parseResult.validRows}</p>
            <p>• Filtered/Skipped: {parseResult.totalRows - parseResult.validRows}</p>
          </div>
          
          {parseResult.skippedRows && parseResult.skippedRows.length > 0 && (
            <details className="mt-3">
              <summary className="text-sm text-green-600 cursor-pointer hover:text-green-800">
                View skipped rows ({parseResult.skippedRows.length})
              </summary>
              <div className="mt-2 text-xs text-gray-600 max-h-32 overflow-y-auto">
                {parseResult.skippedRows.map((row, index) => (
                  <div key={index} className="py-1">{row}</div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h4 className="font-medium text-red-800">Error</h4>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-800">Warning</h4>
        </div>
        <p className="text-sm text-yellow-700">
          This will completely replace all existing staff with the staff from your CSV file.
          Only staff with Active=TRUE and SalesRep=TRUE will be imported.
          Make sure to backup your current staff before proceeding.
        </p>
      </div>

      {/* Upload Button */}
      {parseResult && (
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={16} />
                Replace All Staff ({parseResult.validRows} staff)
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StaffCSVUpload;
