"use server";

import {
  BAD_REQUEST,
  FILE_SIZE_EXCEEDS_LIMIT,
  INTERNAL_SERVER_ERROR,
  ONLY_WEBP_FILES_ALLOWED,
  UNAUTHORIZED,
} from "@/constants/constants";
import { ServerActionResponse } from "@/constants/types";
import { MAX_FILE_SIZE } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const uploadToR2 = async ({
  formData,
}: {
  formData: FormData;
}): Promise<
  ServerActionResponse<{
    imageSrc: string;
  }>
> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        success: false,
        error: UNAUTHORIZED,
      };
    }

    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return {
        success: false,
        error: UNAUTHORIZED,
      };
    }
    const { env } = getCloudflareContext();
    const key = formData.get("key") as string;
    const body = formData.get("body") as File;
    const options = JSON.parse(formData.get("options") as string);
    if (!(key && body)) {
      return {
        success: false,
        error: BAD_REQUEST,
      };
    }

    if (body.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: FILE_SIZE_EXCEEDS_LIMIT,
      };
    }

    if (body.type !== "image/webp") {
      return {
        success: false,
        error: ONLY_WEBP_FILES_ALLOWED,
      };
    }

    await env.MAIN_BUCKET.put(key, await body.arrayBuffer(), options);
    return {
      success: true,
      data: {
        imageSrc: `${process.env.MAIN_R2_BUCKET_PUBLIC_URL}/${key}`,
      },
    };
  } catch {
    return {
      success: false,
      error: INTERNAL_SERVER_ERROR,
    };
  }
};

// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// export const uploadToR2 = async ({
//   formData,
// }: {
//   formData: FormData;
// }): Promise<
//   ServerActionResponse<{
//     imageSrc: string;
//   }>
// > => {
//   try {
//     const session = await verifySession();
//     if (!session) {
//       return {
//         success: false,
//         error: UNAUTHORIZED,
//       };
//     }

//     if (session.user.role !== "admin" && session.user.role !== "owner") {
//       return {
//         success: false,
//         error: UNAUTHORIZED,
//       };
//     }
//     const key = formData.get("key") as string;
//     const body = formData.get("body") as File;
//     if (!(key && body)) {
//       return {
//         success: false,
//         error: BAD_REQUEST,
//       };
//     }

//     if (body.size > MAX_FILE_SIZE) {
//       return {
//         success: false,
//         error: FILE_SIZE_EXCEEDS_LIMIT,
//       };
//     }

//     if (body.type !== "image/webp") {
//       return {
//         success: false,
//         error: ONLY_WEBP_FILES_ALLOWED,
//       };
//     }

//     const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
//     const MAIN_R2_BUCKET_ACCESS_KEY_ID =
//       process.env.MAIN_R2_BUCKET_ACCESS_KEY_ID;
//     const MAIN_R2_BUCKET_SECRET_ACCESS_KEY =
//       process.env.MAIN_R2_BUCKET_SECRET_ACCESS_KEY;

//     if (
//       !CLOUDFLARE_ACCOUNT_ID ||
//       !MAIN_R2_BUCKET_ACCESS_KEY_ID ||
//       !MAIN_R2_BUCKET_SECRET_ACCESS_KEY
//     ) {
//       throw new Error("R2 credentials are not set correctly");
//     }
//     const r2 = new S3Client({
//       region: "auto",
//       endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//       credentials: {
//         accessKeyId: MAIN_R2_BUCKET_ACCESS_KEY_ID,
//         secretAccessKey: MAIN_R2_BUCKET_SECRET_ACCESS_KEY,
//       },
//     });
//     const putObjectCommand = new PutObjectCommand({
//       Bucket: process.env.MAIN_R2_BUCKET_NAME,
//       Key: key,
//       Body: new Uint8Array(await body.arrayBuffer()),
//       ContentType: body.type,
//       ContentLength: body.size,
//     });

//     await r2.send(putObjectCommand);
//     return {
//       success: true,
//       data: {
//         imageSrc: `${process.env.MAIN_R2_BUCKET_PUBLIC_URL}/${key}`,
//       },
//     };
//   } catch {
//     return {
//       success: false,
//       error: INTERNAL_SERVER_ERROR,
//     };
//   }
// };
