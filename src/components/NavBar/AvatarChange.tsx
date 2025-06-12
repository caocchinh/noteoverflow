"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { AVATARS } from "@/constants/constants";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { updateUserAvatar } from "@/server/actions";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

// Infer the return type from authClient.getSession()
type SessionData = Awaited<ReturnType<typeof authClient.getSession>>;

const AvatarChange = ({
  isDialogOpen,
  setIsDialogOpen,
  currentAvatar,
  userId,
}: {
  isDialogOpen: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  currentAvatar: string;
  userId: string;
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [selectedAvatarColor, setSelectedAvatarColor] = useState<string>(
    AVATARS.find((avatar) => avatar.src === currentAvatar)?.color || ""
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const resetDefault = () => {
    setSelectedAvatar(currentAvatar);
    setSelectedAvatarColor(
      AVATARS.find((avatar) => avatar.src === currentAvatar)?.color || ""
    );
  };

  const handleSave = async () => {
    if (selectedAvatar === currentAvatar) {
      setIsDialogOpen(false);
      toast.info("You are already using this avatar");
      return;
    }
    setIsSaving(true);
    const { error, success } = await updateUserAvatar(userId, selectedAvatar);
    if (error) {
      setIsError(true);
      setIsSaving(false);
      toast.error("Unexpected error, unable to update avatar");
      return;
    }
    if (success) {
      queryClient.setQueryData<SessionData>(
        ["user"],
        (oldData: SessionData | undefined) => {
          if (!oldData) return oldData;
          return {
            data: {
              ...oldData.data,
              user: {
                ...oldData.data.user,
                image: selectedAvatar,
              },
            },
          };
        }
      );
    }
    toast.success("Avatar updated successfully");
    setIsDialogOpen(false);
    setIsSaving(false);
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent className="border-foreground/50 bg-[#222222]  max-w-[90vw] sm:!max-w-[600px]">
        <Button
          className="absolute right-[10px] top-[10px] p-0 !bg-transparent cursor-pointer"
          title="Cancel"
          disabled={isSaving}
          onClick={() => {
            setIsDialogOpen(false);
            resetDefault();
          }}
        >
          <X className="text-red-500 hover:text-red-600 !w-[20px] !h-[20px]" />
        </Button>
        <AlertDialogHeader className="flex flex-row gap-2 items-center justify-center">
          <AlertDialogTitle className="text-2xl font-semibold text-center">
            Choose your avatar
          </AlertDialogTitle>

          <div
            className="w-5 h-5 rounded-xs"
            style={{ backgroundColor: selectedAvatarColor }}
          ></div>
          <AlertDialogDescription className="sr-only">
            Select an avatar from the list below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isError && (
          <p className="text-red-500 text-sm text-center -mt-4">
            Error updating avatar
          </p>
        )}
        <div className="flex flex-row flex-wrap gap-4 justify-center">
          {AVATARS.map((avatar, index) => (
            <Button
              className={cn(
                "flex bg-background text-foreground hover:bg-background h-max p-0 items-center flex-col justify-center border-2 border-foreground cursor-pointer rounded-md overflow-hidden",
                "dark:bg-[#222222] dark:text-foreground ",
                selectedAvatar === avatar.src && "border-2 border-red-500",
                selectedAvatar != avatar.src && "hover:border-amber-500"
              )}
              key={index}
              onClick={() => {
                setSelectedAvatar(avatar.src);
                setSelectedAvatarColor(avatar.color);
              }}
            >
              <Image
                src={avatar.src}
                alt="avatar"
                width={100}
                height={100}
                className="pointer-events-none"
              />
              <p className="text-sm text-center p-1">{avatar.name}</p>
            </Button>
          ))}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer"
            onClick={resetDefault}
            disabled={isSaving}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            className="cursor-pointer"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AvatarChange;
