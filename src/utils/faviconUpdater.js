import { getBrandSettings, setBrandSettings, extractBrandSettings, shouldRefreshBrandSettings } from './brandStorage';

/**
 * Utility to dynamically update the favicon based on database data
 */
export const updateFavicon = (faviconUrl) => {
  if (!faviconUrl) return;
  
  const faviconLink = document.getElementById('favicon-link');
  if (faviconLink) {
    faviconLink.href = faviconUrl;
  }
};

/**
 * Update CSS custom properties for brand colors
 */
export const updateBrandColors = (accentColor) => {
  if (!accentColor) return;
  
  // Set CSS custom property for brand color
  document.documentElement.style.setProperty('--brand-color', accentColor);
  
  // Update Tailwind brand color classes dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .text-brand { color: ${accentColor} !important; }
    .bg-brand { background-color: ${accentColor} !important; }
    .border-brand { border-color: ${accentColor} !important; }
    .from-brand { --tw-gradient-from: ${accentColor} !important; }
  `;
  
  // Remove existing brand color styles
  const existingStyle = document.getElementById('dynamic-brand-colors');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  style.id = 'dynamic-brand-colors';
  document.head.appendChild(style);
};

/**
 * Apply brand settings from localStorage or fetch from database
 */
export const applyBrandSettings = async (databaseService) => {
  // Check if we should use cached settings or refresh from database
  const shouldRefresh = shouldRefreshBrandSettings();
  let brandSettings = shouldRefresh ? null : getBrandSettings();
  
  if (!brandSettings || shouldRefresh) {
    try {
      // Fetch fresh data from database
      const formData = await databaseService.getFormData();
      brandSettings = extractBrandSettings(formData);
      
      if (brandSettings) {
        setBrandSettings(brandSettings);
      }
    } catch (error) {
      console.error('Error fetching brand settings:', error);
      // Fall back to cached settings if available
      brandSettings = getBrandSettings();
    }
  }
  
  // Apply the settings
  if (brandSettings) {
    if (brandSettings.favicon) {
      updateFavicon(brandSettings.favicon);
    }
    if (brandSettings.accentColor) {
      updateBrandColors(brandSettings.accentColor);
    }
  }
  
  return brandSettings;
};
