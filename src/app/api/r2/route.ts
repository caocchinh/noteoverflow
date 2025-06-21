import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

async function POST(request: NextRequest) {
  const { env } = getCloudflareContext();
  const formData = await request.formData();
  const key = formData.get("key") as string;
  const body = formData.get("body") as File;
  const options = JSON.parse(formData.get("options") as string);
  await env.MAIN_BUCKET.put(key, body.arrayBuffer(), options);
  return NextResponse.json({
    url: `${process.env.MAIN_R2_BUCKET_PRESIGNED_URL}/${key}`,
  });
}

export { POST };
