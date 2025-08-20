import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const SortSelect = ({ 
  value, 
  onChange, 
  options, 
  className = '' 
}) => {
  const getSortIcon = (direction) => {
    switch (direction) {
      case 'asc':
        return <ArrowUp size={14} />;
      case 'desc':
        return <ArrowDown size={14} />;
      default:
        return <ArrowUpDown size={14} />;
    }
  };

  const currentOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        {getSortIcon(currentOption?.direction)}
      </div>
    </div>
  );
};

export default SortSelect;
