/**
 * Utility functions for URL parameter management
 */

/**
 * Get current URL search parameters
 * @returns {URLSearchParams} Current URL search parameters
 */
export const getCurrentSearchParams = () => {
  return new URLSearchParams(window.location.search);
};

/**
 * Build a URL with preserved search parameters
 * @param {string} path - The path to navigate to
 * @param {URLSearchParams|Object} additionalParams - Additional parameters to add
 * @returns {string} URL with preserved parameters
 */
export const buildUrlWithParams = (path, additionalParams = {}) => {
  const currentParams = getCurrentSearchParams();
  
  // Add any additional parameters
  if (additionalParams instanceof URLSearchParams) {
    additionalParams.forEach((value, key) => {
      currentParams.set(key, value);
    });
  } else if (typeof additionalParams === 'object') {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        currentParams.set(key, value);
      }
    });
  }
  
  const paramString = currentParams.toString();
  return paramString ? `${path}?${paramString}` : path;
};

/**
 * Get workspace ID from URL parameters
 * @returns {string|null} Workspace ID or null if not present
 */
export const getWorkspaceId = () => {
  const params = getCurrentSearchParams();
  return params.get('workspace_id');
};

/**
 * Navigate to a path while preserving current URL parameters
 * @param {string} path - The path to navigate to
 * @param {Object} additionalParams - Additional parameters to add
 * @returns {string} URL with preserved parameters
 */
export const getNavigationUrl = (path, additionalParams = {}) => {
  return buildUrlWithParams(path, additionalParams);
};
