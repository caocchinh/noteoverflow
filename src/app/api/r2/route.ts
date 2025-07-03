import { getCloudflareContext } from '@opennextjs/cloudflare';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  BAD_REQUEST,
  FILE_SIZE_EXCEEDS_LIMIT,
  INTERNAL_SERVER_ERROR,
  MAX_FILE_SIZE,
  ONLY_WEBP_FILES_ALLOWED,
  UNAUTHORIZED,
} from '@/constants/constants';
import { getDbAsync } from '@/drizzle/db';
import { auth } from '@/lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const db = await auth(getDbAsync);
    const session = await db.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 403 });
    }
    const { env } = getCloudflareContext();
    const formData = await request.formData();
    const key = formData.get('key') as string;
    const body = formData.get('body') as File;
    const options = JSON.parse(formData.get('options') as string);
    if (!(key && body)) {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
    }

    if (body.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: FILE_SIZE_EXCEEDS_LIMIT },
        { status: 400 }
      );
    }

    if (body.type !== 'image/webp') {
      return NextResponse.json(
        { error: ONLY_WEBP_FILES_ALLOWED },
        { status: 400 }
      );
    }

    await env.MAIN_BUCKET.put(key, await body.arrayBuffer(), options);
    return NextResponse.json(
      {
        imageSrc: `${process.env.MAIN_R2_BUCKET_PUBLIC_URL}/${key}`,
      },
      {
        status: 200,
      }
    );
  } catch {
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await auth(getDbAsync);
    const session = await db.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 403 });
    }
    const { env } = getCloudflareContext();
    const formData = await request.formData();
    const key = formData.get('key') as string;
    await env.MAIN_BUCKET.delete(key);
    NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch {
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

// Development only
// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// export async function POST(request: NextRequest) {
//   try {
//     const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
//     const MAIN_R2_BUCKET_ACCESS_KEY_ID =
//       process.env.MAIN_R2_BUCKET_ACCESS_KEY_ID;
//     const MAIN_R2_BUCKET_SECRET_ACCESS_KEY =
//       process.env.MAIN_R2_BUCKET_SECRET_ACCESS_KEY;

//     const r2 = new S3Client({
//       region: 'auto',
//       endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//       credentials: {
//         accessKeyId: MAIN_R2_BUCKET_ACCESS_KEY_ID,
//         secretAccessKey: MAIN_R2_BUCKET_SECRET_ACCESS_KEY,
//       },
//     });
//     const formData = await request.formData();
//     const body = formData.get('body') as File;
//     const key = formData.get('key') as string;

//     const arrayBuffer = await body.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     const putObjectCommand = new PutObjectCommand({
//       Bucket: process.env.MAIN_R2_BUCKET_NAME,
//       Key: key,
//       Body: buffer,
//       ContentType: 'image/webp',
//     });

//     await r2.send(putObjectCommand);

//     return NextResponse.json(
//       {
//         imageSrc: `${process.env.MAIN_R2_BUCKET_PUBLIC_URL}/${key}`,
//       },
//       {
//         status: 200,
//       }
//     );
//   } catch {
//     return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
//   }
// }
