import React from 'react';
import { Button } from '../ui/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';

const GallerySection = ({ title, items, onAdd, onEdit, onDelete, renderItem }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <Button
          onClick={onAdd}
          className="flex items-center gap-2 bg-brand hover:bg-brand/90"
        >
          <Plus size={16} />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      {items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                {renderItem(item)}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEdit(item)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-md transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(item)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-white rounded-md transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No {title.toLowerCase()} found</p>
          <p className="text-sm mt-1">Click "Add {title.slice(0, -1)}" to get started</p>
        </div>
      )}
    </div>
  );
};

export default GallerySection;
