"use client";
import { EllipsisVertical, Folder, Loader2, Trash2 } from "lucide-react";
import { truncateListName } from "../lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useIsMutating,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deleteBookmarkListAction } from "../server/actions";
import { toast } from "sonner";
import { SelectedBookmark } from "../constants/types";
import { useState } from "react";

export const ListFolder = ({
  listName,
  visibility,
  listId,
}: {
  listName: string;
  listId: string;
  visibility: "public" | "private";
}) => {
  const queryClient = useQueryClient();
  const mutationKey = ["delete_bookmark_list", listName, visibility];
  const [isDeleteAlertDialogOpen, setIsDeleteAlertDialogOpen] = useState(false);

  const { mutate: deleteList } = useMutation({
    mutationKey,
    mutationFn: async ({
      realListId,
    }: {
      realListId: string;
      realVisibility: "public" | "private";
    }) => {
      await deleteBookmarkListAction({
        listId: realListId,
      });
    },
    onSuccess: (
      _,
      {
        realListId,
      }: { realListId: string; realVisibility: "public" | "private" }
    ) => {
      toast.success("List deleted successfully");
      setIsDeleteAlertDialogOpen(false);
      queryClient.setQueryData<SelectedBookmark[]>(
        ["all_user_bookmarks"],
        (prev: SelectedBookmark[] | undefined) => {
          if (!prev) {
            return prev;
          }
          return prev.filter((bookmark) => !(bookmark.id === realListId));
        }
      );
    },
    onError: (error) => {
      toast.error(
        "Failed to delete bookmark list: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    },
    retry: false,
  });

  const isMutatingThisList = useIsMutating({ mutationKey }) > 0;

  return (
    <div
      className="flex flex-row gap-2 bg-[#f0f4f9] w-[250px] p-2 rounded-sm items-center justify-between"
      title={listName}
    >
      <div className="flex flex-row gap-4 items-center justify-center">
        <Folder fill="black" />
        <h3 className=" text-lg text-black">
          {truncateListName({ listName })}
        </h3>
      </div>
      <Popover>
        <PopoverTrigger className="cursor-pointer">
          <EllipsisVertical size={18} />
        </PopoverTrigger>
        <PopoverContent className="!p-2 w-[180px]">
          <AlertDialog
            open={isDeleteAlertDialogOpen}
            onOpenChange={setIsDeleteAlertDialogOpen}
          >
            <AlertDialogTrigger
              className="flex flex-row gap-2 items-center justify-center w-full hover:bg-muted-foreground/10 p-1 rounded-md cursor-pointer"
              disabled={isMutatingThisList}
            >
              <Trash2 className="text-red-500" /> Remove list
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure you want to delete this list?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All bookmark saved in this list
                  will be deleted.
                </AlertDialogDescription>
                <p>List name: {listName}</p>
                <p>Visibility: {visibility}</p>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  disabled={isMutatingThisList}
                  onClick={() =>
                    deleteList({
                      realListId: listId,
                      realVisibility: visibility,
                    })
                  }
                >
                  Delete
                  {isMutatingThisList && <Loader2 className="animate-spin" />}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PopoverContent>
      </Popover>
    </div>
  );
};
