import { getBrandSettings, setBrandSettings, extractBrandSettings, shouldRefreshBrandSettings, isBrandSettingsValid, getCurrentContractorId } from './brandStorage';

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
export const updateBrandColors = (accentColor, accentDark, accentDarker, accentRgba) => {
  if (!accentColor) return;
  
  // Set CSS custom properties for brand colors
  document.documentElement.style.setProperty('--brand-color', accentColor);
  if (accentDark) document.documentElement.style.setProperty('--brand-color-dark', accentDark);
  if (accentDarker) document.documentElement.style.setProperty('--brand-color-darker', accentDarker);
  if (accentRgba) document.documentElement.style.setProperty('--brand-color-rgba', accentRgba);
  
  // Create transparent version of brand color for gradients
  const brandTransparent = accentRgba ? accentRgba.replace(/[\d\.]+\)$/g, '0)') : `${accentColor}00`;
  
  // Update Tailwind brand color classes dynamically
  const style = document.createElement('style');
  style.innerHTML = `
    .text-brand { color: ${accentColor} !important; }
    .bg-brand { background-color: ${accentColor} !important; }
    .border-brand { border-color: ${accentColor} !important; }
    .from-brand { --tw-gradient-from: ${accentColor} !important; }
    .to-brand { --tw-gradient-to: ${accentColor} !important; }
    .via-brand { --tw-gradient-via: ${accentColor} !important; }
    .to-transparent { --tw-gradient-to: ${brandTransparent} !important; }
    .bg-gradient-to-r.from-brand { background-image: linear-gradient(to right, ${accentColor}, var(--tw-gradient-via), var(--tw-gradient-to)) !important; }
    .bg-gradient-to-r.from-brand.via-brand { background-image: linear-gradient(to right, ${accentColor}, ${accentColor}, var(--tw-gradient-to)) !important; }
    .bg-gradient-to-r.from-brand.via-brand.to-transparent { background-image: linear-gradient(to right, ${accentColor}, ${accentColor}, ${brandTransparent}) !important; }
    .hover\\:text-brand:hover { color: ${accentColor} !important; }
    .hover\\:bg-gray-50:hover { background-color: rgba(249, 250, 251, 1) !important; }
    .focus\\:ring-brand:focus { --tw-ring-color: ${accentColor} !important; }
    .focus\\:outline-none:focus { outline: 2px solid ${accentColor} !important; outline-offset: 2px !important; }
    input:focus, textarea:focus, select:focus { border-color: ${accentColor} !important; box-shadow: 0 0 0 3px ${accentColor}33 !important; }
    button:focus { outline: 2px solid ${accentColor} !important; outline-offset: 2px !important; }
    .group:hover .group-hover\\:from-brand\\/60 { --tw-gradient-from: ${accentColor}99 !important; }
    ${accentDark ? `.bg-brand-dark { background-color: ${accentDark} !important; }` : ''}
    ${accentDark ? `.from-brand-dark { --tw-gradient-from: ${accentDark} !important; }` : ''}
    ${accentDark ? `.to-brand-dark { --tw-gradient-to: ${accentDark} !important; }` : ''}
    ${accentDarker ? `.bg-brand-darker { background-color: ${accentDarker} !important; }` : ''}
    ${accentDarker ? `.from-brand-darker { --tw-gradient-from: ${accentDarker} !important; }` : ''}
    ${accentDarker ? `.to-brand-darker { --tw-gradient-to: ${accentDarker} !important; }` : ''}
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
 * Smart brand settings loader with contractor ID validation
 */
export const loadBrandSettings = async (databaseService) => {
  const currentContractorId = getCurrentContractorId();
  const storedSettings = getBrandSettings();
  
  // Return loading state info and settings
  return {
    needsLoading: !storedSettings || !isBrandSettingsValid(storedSettings),
    settings: storedSettings && isBrandSettingsValid(storedSettings) ? storedSettings : null,
    contractorId: currentContractorId
  };
};

/**
 * Fetch and apply brand settings from database
 */
export const fetchAndApplyBrandSettings = async (databaseService, contractorId = null) => {
  try {
    const formData = await databaseService.getFormData();
    const brandSettings = extractBrandSettings(formData, contractorId || getCurrentContractorId());
    
    if (brandSettings) {
      setBrandSettings(brandSettings);
      
      // Apply the settings immediately
      if (brandSettings.favicon) {
        updateFavicon(brandSettings.favicon);
      }
      if (brandSettings.accentColor) {
        updateBrandColors(brandSettings.accentColor, brandSettings.accentDark, brandSettings.accentDarker, brandSettings.accentRgba);
      }
    }
    
    return brandSettings;
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    throw error;
  }
};

/**
 * Apply brand settings from localStorage or fetch from database
 * @deprecated Use loadBrandSettings and fetchAndApplyBrandSettings instead
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
      updateBrandColors(brandSettings.accentColor, brandSettings.accentDark, brandSettings.accentDarker);
    }
  }
  
  return brandSettings;
};
