/**
 * Resolves any product or user image path into a valid URL for display.
 * Handles:
 * - Full URLs (e.g. http://127.0.0.1:8000/media/products/... or https://...)
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

  if (imagePath.startsWith('/media/')) {
    return `http://127.0.0.1:8000${imagePath}`;
  }

  if (imagePath.startsWith('products/') || imagePath.startsWith('profiles/')) {
    return `http://127.0.0.1:8000/media/${imagePath}`;
  }

  return `http://127.0.0.1:8000/media/products/${imagePath}`;
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

  if (imagePath.startsWith('/media/')) {
    return `http://127.0.0.1:8000${imagePath}`;
  }

  if (imagePath.startsWith('profiles/')) {
    return `http://127.0.0.1:8000/media/${imagePath}`;
  }

  return `http://127.0.0.1:8000/media/${imagePath}`;
};
