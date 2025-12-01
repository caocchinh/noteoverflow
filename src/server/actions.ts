"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { getDbAsync } from "@/drizzle/db.server";
import { user } from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";

export const updateUserAvatarAction = async (avatar: string) => {
  if (!avatar) {
    throw new Error("Avatar is required");
  }

  if (typeof avatar !== "string") {
    throw new Error("Avatar must be a string");
  }
  const authInstance = await auth(getDbAsync);
  const session = await authInstance.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const db = await getDbAsync();
  const response = await db
    .update(user)
    .set({ selectedImage: avatar })
    .where(eq(user.id, session.user.id));
  if (response.error) {
    throw new Error("User not found");
  }
};
