"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { AVATARS } from "@/constants/constants";
import type { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { updateUserAvatarAction } from "@/server/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

// Infer the return type from authClient.getSession()
type SessionData = Awaited<ReturnType<typeof authClient.getSession>>;

const AvatarChange = ({
  isDialogOpen,
  setIsDialogOpen,
  currentAvatar,
  userId,
  defaultAvatar,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentAvatar: string;
  userId: string;
  defaultAvatar?: string | null;
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [selectedAvatarColor, setSelectedAvatarColor] = useState<string>(
    AVATARS.find((avatar) => avatar.src === currentAvatar)?.color || ""
  );
  const queryClient = useQueryClient();

  const resetDefault = () => {
    setSelectedAvatar(currentAvatar);
    setSelectedAvatarColor(
      AVATARS.find((avatar) => avatar.src === currentAvatar)?.color || ""
    );
  };

  const updateAvatarMutation = useMutation({
    mutationFn: () => updateUserAvatarAction(userId, selectedAvatar),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user"] });
      // Get the previous data so we can roll back to it if the mutation fails
      const previousData = queryClient.getQueryData<SessionData>(["user"]);

      // Optimistically update to the new value
      queryClient.setQueryData<SessionData>(
        ["user"],
        (oldData: SessionData | undefined) => {
          if (!oldData) {
            return oldData;
          }
          return {
            data: {
              ...oldData.data,
              user: {
                ...oldData.data.user,
                selectedImage: selectedAvatar,
              },
            },
          };
        }
      );
      return { previousData };
    },
    onError: (error, _variables, context: SessionData) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousData) {
        queryClient.setQueryData(["user"], context.previousData);
      }
      toast.error(
        `Failed to update avatar: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully");
      setIsDialogOpen(false);
    },
  });

  const handleSave = () => {
    if (selectedAvatar === currentAvatar) {
      setIsDialogOpen(false);
      toast.info("You are already using this avatar");
      return;
    }
    updateAvatarMutation.mutate();
  };

  return (
    <AlertDialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <AlertDialogContent className="sm:!max-w-[600px] max-w-[90vw] !max-h-[90vh] overflow-y-auto border-foreground/50 bg-white dark:bg-[#222222]">
        <Button
          className="!bg-transparent absolute top-0 right-0 cursor-pointer p-0"
          disabled={updateAvatarMutation.isPending}
          onClick={() => {
            setIsDialogOpen(false);
            resetDefault();
          }}
          title="Cancel"
        >
          <X className="!w-[20px] !h-[20px] text-red-500 hover:text-red-600" />
        </Button>
        <AlertDialogHeader className="flex flex-row flex-wrap items-center justify-center gap-2">
          <AlertDialogTitle className="text-center font-semibold text-2xl">
            Choose your avatar
          </AlertDialogTitle>

          {selectedAvatar !== defaultAvatar && (
            <div
              className="h-5 w-5 rounded-xs"
              style={{ backgroundColor: selectedAvatarColor }}
            />
          )}
          {selectedAvatar === defaultAvatar && (
            <Image
              alt="avatar"
              className="h-5 w-5 rounded-xs"
              src={defaultAvatar}
              width={20}
              height={20}
            />
          )}
          <AlertDialogDescription className="sr-only">
            Select an avatar from the list below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {updateAvatarMutation.isError && (
          <p className="-mt-4 text-center text-red-500 text-sm">
            Error updating avatar
          </p>
        )}
        {defaultAvatar && (
          <Button
            onClick={() => {
              setSelectedAvatar(defaultAvatar);
              setSelectedAvatarColor(
                AVATARS.find((avatar) => avatar.src === currentAvatar)?.color ||
                  ""
              );
            }}
            className={cn(
              "cursor-pointer",
              selectedAvatar === defaultAvatar &&
                "border-2 border-red-500 !bg-logo-main !text-white"
            )}
          >
            Default
          </Button>
        )}
        <ScrollArea className=" h-[300px]">
          <div className="flex flex-row flex-wrap justify-center gap-4">
            {AVATARS.map((avatar) => (
              <Button
                className={cn(
                  "flex h-max cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-foreground bg-background p-0 text-foreground hover:bg-background",
                  "dark:bg-[#222222] dark:text-foreground ",
                  selectedAvatar === avatar.src && "border-2 border-red-500",
                  selectedAvatar !== avatar.src && "hover:border-amber-500"
                )}
                key={avatar.src}
                onClick={() => {
                  setSelectedAvatar(avatar.src);
                  setSelectedAvatarColor(avatar.color);
                }}
              >
                <Image
                  alt="avatar"
                  className="pointer-events-none"
                  height={100}
                  src={avatar.src}
                  width={100}
                />
                <p className="p-1 text-center text-sm">{avatar.name}</p>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            disabled={updateAvatarMutation.isPending}
            onClick={resetDefault}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            className="cursor-pointer"
            disabled={updateAvatarMutation.isPending}
            onClick={handleSave}
          >
            {updateAvatarMutation.isPending ? "Saving" : "Save"}
            {updateAvatarMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarChange;
