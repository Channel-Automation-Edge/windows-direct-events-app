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
 * Get current contractor ID from URL or default
 */
export const getCurrentContractorId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const workspaceId = urlParams.get('workspace_id');
  return workspaceId ? parseInt(workspaceId, 10) : 12347;
};

/**
 * Extract brand settings from form data
 */
export const extractBrandSettings = (formData, contractorId = null) => {
  if (!formData) return null;
  
  return {
    contractorId: contractorId || getCurrentContractorId(),
    name: formData.name || 'Your Company Name',
    logo: formData.content?.logo || null,
    favicon: formData.favicon || null,
    accentColor: formData.colors?.accent || null,
    accentRgba: formData.colors?.accent_rgba || null,
    accentDark: formData.colors?.dark || null,
    accentDarker: formData.colors?.darker || null,
    timestamp: Date.now()
  };
};

/**
 * Check if stored brand settings are valid for current contractor
 */
export const isBrandSettingsValid = (brandSettings) => {
  if (!brandSettings || !brandSettings.contractorId) return false;
  
  const currentContractorId = getCurrentContractorId();
  return brandSettings.contractorId === currentContractorId;
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
