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
  previewUrl?: string; // For image searches (data URL with prefix)
};

const SEARCH_HISTORY_KEY = "search-history";
const MAX_HISTORY_ITEMS = 50;

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
  item: Omit<SearchHistoryItem, "id" | "timestamp">
): Promise<void> {
  try {
    const history = await getSearchHistory();

    // Create new history item with id and timestamp
    const newItem: SearchHistoryItem = {
      ...item,
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
