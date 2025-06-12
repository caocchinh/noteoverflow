"use server";
import { getAuthDb } from "@/drizzle/auth/db";
import * as schema from "@/drizzle/auth/schema";
import { eq } from "drizzle-orm";

export const updateUserAvatar = async (userId: string, avatar: string) => {
  if (!userId || !avatar) {
    return { error: "User ID and avatar are required", success: false };
  }

  if (typeof userId !== "string" || typeof avatar !== "string") {
    return { error: "User ID and avatar must be strings", success: false };
  }

  try {
    await getAuthDb()
      .update(schema.user)
      .set({ image: avatar })
      .where(eq(schema.user.id, userId));

    return { success: true, error: null };
  } catch (error) {
    return { error: error, success: false };
  }
};
