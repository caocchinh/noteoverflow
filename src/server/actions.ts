"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { auth } from "@/lib/auth/auth";

export const updateUserAvatar = async (userId: string, avatar: string) => {
  if (!userId || !avatar) {
    throw new Error("User ID and avatar are required");
  }

  if (typeof userId !== "string" || typeof avatar !== "string") {
    throw new Error("User ID and avatar must be strings");
  }
  const response = await getDb()
    .update(schema.user)
    .set({ image: avatar })
    .where(eq(schema.user.id, userId));
  if (response.rowCount === 0) {
    throw new Error("User not found");
  }
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  const response = await auth().api.userHasPermission({
    body: {
      userId,
      permission: {
        project: ["create", "update", "delete"],
      },
    },
  });
  if (response.error) {
    throw new Error("Failed to check admin status");
  }
  return response.success;
};

export const isOwner = async (userId: string): Promise<boolean> => {
  const response = await auth().api.userHasPermission({
    body: {
      userId,
      permission: {
        project: ["create", "update", "delete"],
        user: [
          "create",
          "list",
          "set-role",
          "ban",
          "impersonate",
          "delete",
          "set-password",
        ],
      },
    },
  });
  if (response.error) {
    throw new Error("Failed to check admin status");
  }
  return response.success;
};
