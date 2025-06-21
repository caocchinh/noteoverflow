"use server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function UploadToR2({
  key,
  body,
  options = {},
}: {
  key: string;
  body: ReadableStream | ArrayBuffer | string | Blob | FormData;
  options?: {
    httpMetadata?: {
      contentType?: string;
      contentLanguage?: string;
      contentDisposition?: string;
      contentEncoding?: string;
      cacheControl?: string;
      cacheExpiry?: Date;
    };
    customMetadata?: Record<string, string>;
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha384?: string;
    sha512?: string;
  };
}) {
  const { env } = getCloudflareContext();

  await env.MAIN_BUCKET.put(key, body, options);
  return process.env.MAIN_R2_BUCKET_PRESIGNED_URL;
}
