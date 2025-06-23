import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getDbAsync } from "@/drizzle/db";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "@/constants/constants";

export async function POST(request: NextRequest) {
  try {
    const db = await auth(getDbAsync);
    const session = await db.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }

    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 403 });
    }
    const { env } = getCloudflareContext();
    const formData = await request.formData();
    const key = formData.get("key") as string;
    const body = formData.get("body") as File;
    const options = JSON.parse(formData.get("options") as string);
    if (!key || !body) {
      return NextResponse.json({ error: BAD_REQUEST }, { status: 400 });
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
