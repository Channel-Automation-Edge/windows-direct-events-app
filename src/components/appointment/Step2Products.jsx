import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { useDataContext } from '../../context/DataContext';
import { cn } from '../../lib/utils';
import { Loader } from 'lucide-react';

const Step2Products = ({ onNext, onBack }) => {
  const { formData, updateFormField } = useAppContext();
  const { products, loading, error, refreshData } = useDataContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  
  // Fetch products data once when component mounts
  useEffect(() => {
    if (!dataFetched) {
      console.log('Step2Products: Fetching products once on mount');
      refreshData('products');
      setDataFetched(true);
    }
  }, [dataFetched, refreshData]);
  
  // Initialize selected product from AppContext when component loads
  useEffect(() => {
    if (formData.product) {
      setSelectedProduct(formData.product);
    }
  }, [formData.product]);
  
  // Update AppContext when navigating away
  const handleNext = (e) => {
    // Prevent default behavior if event exists
    if (e) e.preventDefault();
    
    console.log('Step2: handleNext called');
    // Update the form data with selected product
    updateFormField('product', selectedProduct);
    console.log('Step2: Calling onNext prop');
    
    // Force navigation to the next step
    setTimeout(() => {
      if (typeof onNext === 'function') {
        onNext();
      } else {
        console.error('Step2: onNext is not a function', onNext);
      }
    }, 0);
  };
  
  const handleBack = () => {
    updateFormField('product', selectedProduct);
    onBack();
  };
  
  const selectProduct = (product) => {
    // If the same product is clicked, deselect it
    if (selectedProduct && selectedProduct.id === product.id) {
      setSelectedProduct(null);
    } else {
      // Select the new product
      setSelectedProduct(product);
    }
  };
  
  const isProductSelected = (productId) => {
    return selectedProduct && selectedProduct.id === productId;
  };
  
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 mb-6">
        Please select one product you're interested in.
      </p>
      
      {/* Products Grid */}
      <div className="space-y-8">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-[20px]" style={{ marginTop: '15px', width: '100%' }}>
          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader className="animate-spin h-8 w-8 text-brand" />
              <span className="ml-2">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 p-5 text-center">
              {error}
              <Button 
                onClick={() => {
                  setDataFetched(false);
                  refreshData('products');
                }} 
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : products.map((product) => {
            const isSelected = isProductSelected(product.id);
            const accent = '#FF7A00';
            const accent_rgba = 'rgba(255, 122, 0, 0.3)';
            
            return (
              <div
                key={product.id}
                className="flex flex-row sm:flex-col items-center justify-start sm:justify-center w-full sm:w-[210px] h-[80px] sm:h-[156px] rounded-xl p-4 hover:scale-100 sm:hover:scale-105 transform transition-transform bg-white cursor-pointer"
                onClick={() => selectProduct(product)}
                style={{
                  boxShadow: isSelected 
                    ? `${accent_rgba} 0px 10px 25px -6px` 
                    : 'rgba(0, 0, 0, 0.07) 0px 22px 30px -6px',
                  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: isSelected 
                    ? accent 
                    : 'rgba(157, 176, 197, 0.25)',
                  backgroundColor: isSelected ? 'rgba(255, 122, 0, 0.05)' : 'white'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.boxShadow = `${accent_rgba} 0px 10px 25px -6px`;
                    e.currentTarget.style.borderColor = accent_rgba;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.boxShadow = 'rgba(0, 0, 0, 0.07) 0px 10px 25px -6px';
                    e.currentTarget.style.borderColor = 'rgba(157, 176, 197, 0.25)';
                  }
                }}
              >
                <div className="w-16 h-16 mr-3 sm:mr-0 sm:mb-3 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/images/placeholder-product.png";
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-brand/10 rounded-md flex items-center justify-center text-brand">
                      {product.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-gray-800 text-base font-medium text-left sm:text-center">{product.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    
      
      {/* Navigation Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Button 
          variant="secondary"
          onClick={handleBack}
          className="gap-2"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          className="gap-2"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Step2Products;
