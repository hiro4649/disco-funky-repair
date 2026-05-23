/**
 * Utility functions for handling image paths and URLs
 */

/**
 * Normalizes an image path to extract just the filename or relative path
 * Handles Windows absolute paths, Unix absolute paths, and relative paths
 * 
 * @param imagePath - The image path from database (could be absolute or relative)
 * @returns Normalized path (e.g., "/images/trial-nfts/filename.png" or "/images/filename.png")
 */
export const normalizeImagePath = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize path separators (convert backslashes to forward slashes)
  const normalized = imagePath.replace(/\\/g, '/');
  
  // If it's already in the correct trial-nfts format, return as-is
  if (normalized.startsWith('/images/trial-nfts/')) {
    return normalized;
  }
  
  // If it's an old format (/images/filename.png), check if it should be trial-nfts
  if (normalized.startsWith('/images/') && !normalized.startsWith('/images/trial-nfts/')) {
    const filename = normalized.split('/').pop() || '';
    // Check if this looks like a Trial NFT filename (timestamp pattern: numbers----filename)
    if (filename && /^\d+----/.test(filename)) {
      // Convert old path to new format
      return `/images/trial-nfts/${filename}`;
    }
    // Not a trial NFT, return as-is
    return normalized;
  }
  
  // Extract filename from any path format
  const filename = normalized.split('/').pop() || normalized;
  
  // If filename exists, check if it's a trial NFT (contains timestamp pattern)
  // Otherwise, return as /images/filename
  if (filename) {
    // Trial NFTs are now stored in /images/trial-nfts/
    // Check if path contains trial-nfts or if it's a new upload
    if (normalized.includes('trial') || normalized.includes('Trial') || /^\d+----/.test(filename)) {
      return `/images/trial-nfts/${filename}`;
    }
    return `/images/${filename}`;
  }
  
  return normalized;
};

/**
 * Constructs the full image URL from a path
 * For Trial NFTs: images are now on IPFS, return IPFS URL directly
 * For other images: construct backend URL if needed
 * 
 * @param imagePath - The image path from database (can be IPFS URL or local path)
 * @param baseUrl - Optional base URL (for non-public images, defaults to NEXT_PUBLIC_API_URL without /api)
 * @returns Full image URL (always returns absolute URL, never relative)
 */
export const getImageUrl = (imagePath: string | null | undefined, baseUrl?: string): string => {
  if (!imagePath) return '';
  
  // If already a full URL (IPFS or HTTP), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Normalize the path (this will handle old paths and convert them)
  const normalizedPath = normalizeImagePath(imagePath);
  
  // For other images that might still be on backend, construct backend URL
  // Get base URL
  const backendBaseUrl = baseUrl || (typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')
    : 'http://localhost:8000');
  
  // Construct full URL
  return `${backendBaseUrl}${normalizedPath}`;
};
