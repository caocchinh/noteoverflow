import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const MAIN_R2_BUCKET_ACCESS_KEY_ID = process.env.MAIN_R2_BUCKET_ACCESS_KEY_ID;
  const MAIN_R2_BUCKET_SECRET_ACCESS_KEY =
    process.env.MAIN_R2_BUCKET_SECRET_ACCESS_KEY;

  if (
    !CLOUDFLARE_ACCOUNT_ID ||
    !MAIN_R2_BUCKET_ACCESS_KEY_ID ||
    !MAIN_R2_BUCKET_SECRET_ACCESS_KEY
  ) {
    throw new Error("R2 credentials are not set correctly");
  }
  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: MAIN_R2_BUCKET_ACCESS_KEY_ID,
      secretAccessKey: MAIN_R2_BUCKET_SECRET_ACCESS_KEY,
    },
  });
  const formData = await request.formData();
  const file = formData.get("file") as Blob;
  const contentType = formData.get("contentType") as string;
  const filename = formData.get("filename") as string;

  if (!file || !contentType || !filename) {
    throw new Error("File, contentType, or filename is not set correctly");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.MAIN_R2_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
  });

  await r2.send(putObjectCommand);

  const publicUrl = process.env.MAIN_R2_BUCKET_PRESIGNED_URL + "/" + filename;

  return Response.json({
    url: publicUrl,
  });
}
