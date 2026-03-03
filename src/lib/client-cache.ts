const STORE_NAME = "noteoverflow-kv-cache";

let dbPromise: Promise<IDBDatabase>;

const openCacheKVDatabase = (dbName: string) => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available."));
  }
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName);

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject("indexedDB request error");
      };
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" });
      };
    });
  }
  return dbPromise;
};

function idbRequestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const openStore = async () => {
  const db = await openCacheKVDatabase(STORE_NAME);
  return db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
};

type Pair<T = unknown> = { key: string; value: T };

export async function getCache<T>(key: string): Promise<T | undefined> {
  try {
    const store = await openStore();
    const pair: Pair<T> | undefined = await idbRequestToPromise(store.get(key));
    return pair?.value;
  } catch (error) {
    console.error("Failed to get from cache:", error);
    return undefined;
  }
}

export async function setCache<T>(key: string, value: T) {
  try {
    const store = await openStore();
    const pair: Pair<T> = { key, value };
    await idbRequestToPromise(store.put(pair));
  } catch (error) {
    console.error("Failed to set cache:", error);
  }
}

export async function deleteCache(key: string) {
  try {
    const store = await openStore();
    await idbRequestToPromise(store.delete(key));
  } catch (error) {
    console.error("Failed to delete cache:", error);
  }
}

// Search History Types and Functions
export type SearchHistoryItem = {
  id: string;
  type: "text" | "image";
  query: string; // Text query or base64 image data
  timestamp: number;
  previewUrl?: string; // Compressed thumbnail for fast display in history list
  imageData?: string; // Full original image data for re-searching
  filter?: {
    subject?: string;
    curriculum?: string;
    year?: string[];
    season?: string[];
    paperType?: string[];
  };
};

const SEARCH_HISTORY_KEY = "search-history";
const MAX_HISTORY_ITEMS = 67;
const THUMBNAIL_MAX_SIZE = 150; // 67x67 pixels max
const THUMBNAIL_QUALITY = 0.9; // JPEG compression quality

/**
 * Creates a compressed thumbnail from an image data URL.
 * Reduces image size from ~500KB to ~3KB for fast loading.
 */
async function createThumbnail(
  imageDataUrl: string,
  maxSize: number = THUMBNAIL_MAX_SIZE,
  quality: number = THUMBNAIL_QUALITY,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");

      // Calculate dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Export as compressed JPEG (much smaller than PNG)
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
}

export async function getSearchHistory(): Promise<SearchHistoryItem[]> {
  try {
    const history = await getCache<SearchHistoryItem[]>(SEARCH_HISTORY_KEY);
    return history || [];
  } catch (error) {
    console.error("Failed to get search history:", error);
    return [];
  }
}

export async function addSearchHistory(
  item: Omit<SearchHistoryItem, "id" | "timestamp">,
): Promise<void> {
  try {
    const history = await getSearchHistory();

    // For image searches: create thumbnail for preview, keep original for re-searching
    let previewUrl = item.previewUrl;
    let imageData = item.imageData;

    if (item.type === "image" && previewUrl) {
      // Store original image in imageData if not already provided
      if (!imageData) {
        imageData = previewUrl;
      }
      // Create compressed thumbnail for display
      try {
        previewUrl = await createThumbnail(previewUrl);
      } catch (error) {
        console.warn("Failed to create thumbnail, using original:", error);
        // Keep original if thumbnail creation fails
      }
    }

    // Create new history item with id and timestamp
    const newItem: SearchHistoryItem = {
      ...item,
      previewUrl,
      imageData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to beginning of array (most recent first)
    const updatedHistory = [newItem, ...history];

    // Keep only the last 50 items
    const trimmedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    await setCache(SEARCH_HISTORY_KEY, trimmedHistory);
  } catch (error) {
    console.error("Failed to add search history:", error);
  }
}

export async function removeSearchHistoryItem(id: string): Promise<void> {
  try {
    const history = await getSearchHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    await setCache(SEARCH_HISTORY_KEY, updatedHistory);
  } catch (error) {
    console.error("Failed to remove search history item:", error);
  }
}

export async function clearSearchHistory(): Promise<void> {
  try {
    await deleteCache(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear search history:", error);
  }
}
