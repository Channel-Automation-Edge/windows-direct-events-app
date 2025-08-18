import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const EventsCSVUpload = ({ onUpload, loading = false }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState(null);
  const [error, setError] = useState(null);

  // Parse CSV content and extract events
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
      const sourceCodeIndex = headers.findIndex(h => h.toLowerCase() === 'sourcecode');
      const descrIndex = headers.findIndex(h => h.toLowerCase() === 'descr');
      const activeIndex = headers.findIndex(h => h.toLowerCase() === 'active');

      if (idIndex === -1 || sourceCodeIndex === -1 || descrIndex === -1 || activeIndex === -1) {
        throw new Error('CSV must contain columns: ID, SourceCode, Descr, Active');
      }

      // Parse data rows
      const events = [];
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
        
        if (row.length < headers.length) continue; // Skip incomplete rows
        
        const sourceCode = row[sourceCodeIndex];
        
        // Only process rows where SourceCode = 'Event'
        if (sourceCode === 'Event') {
          const event = {
            srs_id: row[idIndex],
            name: row[descrIndex],
            active: row[activeIndex].toLowerCase() === 'true'
          };
          
          // Validate required fields
          if (event.srs_id && event.name) {
            events.push(event);
          }
        }
      }

      return {
        success: true,
        events,
        totalRows: lines.length - 1,
        eventRows: events.length
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
    if (parseResult && parseResult.events.length > 0) {
      onUpload(parseResult.events, handleReset);
    }
  };

  // Reset component
  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    setError(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="w-5 h-5 text-brand" />
        <h3 className="text-lg font-semibold">Bulk Upload Events</h3>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-brand bg-orange-50'
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
          CSV must contain: ID, SourceCode, Descr, Active columns
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          id={`csv-upload-${Date.now()}`}
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
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">CSV Parsed Successfully</span>
          </div>
          <p className="text-sm text-green-700">
            Found {parseResult.eventRows} events out of {parseResult.totalRows} total rows
          </p>
          <p className="text-xs text-green-600 mt-1">
            Only rows with SourceCode = 'Event' will be imported
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Error</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      {parseResult && parseResult.events.length > 0 && (
        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Uploading...' : `Upload ${parseResult.events.length} Events`}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Warning */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">Warning</span>
        </div>
        <p className="text-sm text-yellow-700 mt-1">
          This will completely replace all existing events with the events from your CSV file.
          Make sure to backup your current events before proceeding.
        </p>
      </div>
    </div>
  );
};

export default EventsCSVUpload;
