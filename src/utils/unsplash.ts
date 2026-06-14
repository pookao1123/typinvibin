const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

interface UnsplashRandomPhoto {
  urls?: {
    regular?: string;
  };
}

// Cache one image URL per query so revisiting a topic doesn't refetch.
// Persisted to localStorage so backgrounds survive reloads even while the
// Unsplash demo key is rate-limited (50 requests/hour → 403s).
const CACHE_KEY = 'typinvibin_bg_cache';

function loadCache(): Map<string, string> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      return new Map(Object.entries(JSON.parse(raw) as Record<string, string>));
    }
  } catch {
    // Corrupt cache — start fresh
  }
  return new Map();
}

const imageCache = loadCache();

function persistCache(): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(imageCache)));
  } catch {
    // Storage unavailable/full — cache stays in-memory only
  }
}

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

async function requestRandomImage(query: string): Promise<string | null> {
  if (!ACCESS_KEY) {
    return null;
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
  return url;
}

/**
 * Fetch a random Unsplash photo for a query and preload it.
 * Cached per query — repeat visits to a topic reuse the same image.
 */
export async function fetchTopicImage(query: string): Promise<string | null> {
  const cached = imageCache.get(query);
  if (cached) {
    return cached;
  }

  const url = await requestRandomImage(query);
  if (url) {
    imageCache.set(query, url);
    persistCache();
  }
  return url;
}

/**
 * Fetch a fresh random photo for the topic, bypassing the cache —
 * used by the periodic background randomizer. Updates the cache so the
 * next topic visit shows the latest image.
 */
export async function fetchFreshTopicImage(query: string): Promise<string | null> {
  const url = await requestRandomImage(query);
  if (url) {
    imageCache.set(query, url);
    persistCache();
  }
  return url;
}
