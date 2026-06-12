const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

interface UnsplashRandomPhoto {
  urls?: {
    regular?: string;
  };
}

// Cache one image URL per query so revisiting a topic doesn't refetch
const imageCache = new Map<string, string>();

/**
 * Preload an image so the background only swaps once it's ready
 * @param url - Image URL to preload
 * @returns Resolves with the URL when loaded
 */
function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/**
 * Fetch a random Unsplash photo for a query and preload it
 * @param query - Search term (current topic name)
 * @returns Loaded image URL, or null if no API key
 */
export async function fetchTopicImage(query: string): Promise<string | null> {
  if (!ACCESS_KEY) {
    return null;
  }

  const cached = imageCache.get(query);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    query,
    orientation: 'landscape',
    content_filter: 'high',
    client_id: ACCESS_KEY,
  });

  const response = await fetch(`https://api.unsplash.com/photos/random?${params}`);
  if (!response.ok) {
    throw new Error(`Unsplash request failed: ${response.status}`);
  }

  const data: UnsplashRandomPhoto = await response.json();
  const url = data?.urls?.regular;
  if (!url) {
    return null;
  }

  await preloadImage(url);
  imageCache.set(query, url);
  return url;
}
