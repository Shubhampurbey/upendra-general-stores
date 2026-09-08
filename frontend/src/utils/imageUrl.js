import { API_BASE_URL } from '../api/client';

/**
 * Helper to get backend root URL without '/api' suffix
 */
const getBackendBaseUrl = () => {
  return API_BASE_URL.replace(/\/api\/?$/, '');
};

/**
 * Resolves any product or user image path into a valid URL for display.
 * Handles:
 * - Full URLs (e.g. https://... or http://...)
 * - Local media paths (e.g. /media/profiles/... or profiles/...)
 * - Static assets (e.g. /assets/images/spices.jpg)
 * - Object URLs (blob:...) and Data URLs (data:...) for live previews
 */
export const getProductImageUrl = (imagePath) => {
  if (!imagePath) {
    return '/assets/images/spices.jpg';
  }

  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }

  if (imagePath.startsWith('/assets/')) {
    return imagePath;
  }

  const backendBase = getBackendBaseUrl();

  if (imagePath.startsWith('/media/')) {
    return `${backendBase}${imagePath}`;
  }

  if (imagePath.startsWith('products/') || imagePath.startsWith('profiles/')) {
    return `${backendBase}/media/${imagePath}`;
  }

  return `${backendBase}/media/products/${imagePath}`;
};

export const getUserAvatarUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }

  if (imagePath.startsWith('/assets/')) {
    return imagePath;
  }

  const backendBase = getBackendBaseUrl();

  if (imagePath.startsWith('/media/')) {
    return `${backendBase}${imagePath}`;
  }

  if (imagePath.startsWith('profiles/')) {
    return `${backendBase}/media/${imagePath}`;
  }

  return `${backendBase}/media/${imagePath}`;
};

