/**
 * Utility to manage brand settings in localStorage
 */

const BRAND_STORAGE_KEY = 'windowsDirectBrandSettings';

/**
 * Get brand settings from localStorage
 */
export const getBrandSettings = () => {
  try {
    const stored = localStorage.getItem(BRAND_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading brand settings from localStorage:', error);
    return null;
  }
};

/**
 * Store brand settings in localStorage
 */
export const setBrandSettings = (settings) => {
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error storing brand settings in localStorage:', error);
  }
};

/**
 * Extract brand settings from form data
 */
export const extractBrandSettings = (formData) => {
  if (!formData) return null;
  
  return {
    name: formData.name || 'Your Company Name',
    logo: formData.content?.logo || null,
    favicon: formData.favicon || null,
    accentColor: formData.colors?.accent || null,
    timestamp: Date.now()
  };
};

/**
 * Check if brand settings should be refreshed (only on page refresh)
 */
export const shouldRefreshBrandSettings = () => {
  // Check if this is a page refresh vs navigation
  // performance.navigation.type === 1 means reload/refresh
  return performance.navigation?.type === 1 || 
         performance.getEntriesByType('navigation')[0]?.type === 'reload';
};
