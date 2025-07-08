import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import { cache } from "react";
import * as schema from "./schema";

//  npx wrangler d1 execute noteoverflow --file=./src/drizzle/migrations/{$filename} --> Local development
//  npx wrangler d1 execute noteoverflow --file=./src/drizzle/migrations/{$filename} --remote --> Remote development

export const getDb = cache(() => {
  const { env } = getCloudflareContext();
  return drizzle(env.MAIN_DB, { schema });
});

// This is the one to use for static routes (i.e. ISR/SSG)
export const getDbAsync = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.MAIN_DB, { schema });
});

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
