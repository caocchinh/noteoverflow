import "server-only";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
// Use Vectorize-specific token if available, otherwise fall back to AI token
const CLOUDFLARE_API_TOKEN =
  process.env.CLOUDFLARE_VECTORIZE_API_TOKEN ||
  process.env.CLOUDFLARE_AI_API_TOKEN;

const CLOUDFLARE_API_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/vectorize/v2/indexes`;

export interface VectorizeVector {
  id: string;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorizeQueryOptions {
  topK?: number;
  returnMetadata?: "all" | "indexed" | "none";
  filter?: unknown;
}

export interface VectorizeMatch {
  id: string;
  score: number;
  values: number[];
  metadata?: Record<string, unknown>;
}

export interface VectorizeQueryResponse {
  matches: VectorizeMatch[];
  count: number;
}

/**
 * Call Cloudflare Vectorize REST API
 */
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

async function callVectorizeAPI<T>(
  indexName: string,
  endpoint: string,
  method: "POST" | "GET" | "DELETE",
  body?: unknown
): Promise<T> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error(
      "Cloudflare credentials missing. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN (or CLOUDFLARE_VECTORIZE_API_TOKEN) in your environment variables."
    );
  }

  let lastError: Error | null = null;
  const url = `${CLOUDFLARE_API_BASE_URL}/${indexName}/${endpoint}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        const statusCode = response.status;

        // Cleanup error message
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.errors && Array.isArray(errorJson.errors)) {
            errorMessage = errorJson.errors
              .map((e: { message: string }) => e.message)
              .join(", ");
          }
        } catch {
          // ignore json parse error
        }

        const error = new Error(
          `Cloudflare Vectorize API error (${statusCode}): ${errorMessage}`
        );

        // Retry on timeout (408) or server errors (5xx)
        if (statusCode === 408 || statusCode >= 500) {
          lastError = error;
          if (attempt < MAX_RETRIES - 1) {
            console.log(
              `Vectorize API timeout/error, retrying in ${
                RETRY_DELAYS[attempt]
              }ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAYS[attempt])
            );
            continue;
          }
          throw lastError;
        }

        throw error;
      }

      const data = (await response.json()) as {
        success: boolean;
        result: T;
        errors?: unknown[];
      };

      if (!data.success) {
        throw new Error(
          `Cloudflare Vectorize API success=false: ${JSON.stringify(
            data.errors
          )}`
        );
      }

      return data.result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (
        attempt < MAX_RETRIES - 1 &&
        (lastError.message.includes("408") ||
          lastError.message.includes("timeout") ||
          lastError.message.includes("ECONNRESET") ||
          lastError.message.includes("fetch failed"))
      ) {
        console.log(
          `Vectorize API network error, retrying in ${
            RETRY_DELAYS[attempt]
          }ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[attempt])
        );
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error("Vectorize request failed after retries");
}

/**
 * Insert or update vectors in a Vectorize index
 * @param indexName Name of the index
 * @param vectors Array of vectors to insert
 */
export async function upsertVectorize(
  indexName: string,
  vectors: VectorizeVector[]
): Promise<{ count: number; ids: string[] }> {
  // Use 'insert' endpoint. Vectorize inserts naturally handle upserts (replacing by ID if exists).
  // Note: Standard endpoint is /insert. ndjson is also supported but JSON array is easier for small batches.
  return callVectorizeAPI<{ count: number; ids: string[] }>(
    indexName,
    "insert",
    "POST",
    vectors
  );
}

/**
 * Query a Vectorize index
 * @param indexName Name of the index
 * @param vector Query vector
 * @param options Query options (topK, metadata, etc.)
 */
export async function queryVectorize(
  indexName: string,
  vector: number[],
  options?: VectorizeQueryOptions
): Promise<VectorizeQueryResponse> {
  const payload = {
    vector,
    topK: options?.topK ?? 5,
    returnMetadata: options?.returnMetadata ?? "all",
    filter: options?.filter,
  };

  return callVectorizeAPI<VectorizeQueryResponse>(
    indexName,
    "query",
    "POST",
    payload
  );
}
