"use server";
import { getAuthDb } from "@/drizzle/auth/db";
import * as schema from "@/drizzle/auth/schema";
import { eq } from "drizzle-orm";

export const updateUserAvatar = async (userId: string, avatar: string) => {
  if (!userId || !avatar) {
    throw new Error("User ID and avatar are required");
  }

  if (typeof userId !== "string" || typeof avatar !== "string") {
    throw new Error("User ID and avatar must be strings");
  }
  const response = await getAuthDb()
    .update(schema.user)
    .set({ image: avatar })
    .where(eq(schema.user.id, userId));
  if (response.rowCount === 0) {
    throw new Error("User not found");
  }
};
