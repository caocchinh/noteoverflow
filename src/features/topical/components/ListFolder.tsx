"use client";
import {
  EllipsisVertical,
  Folder,
  Loader2,
  Send,
  Telescope,
  Trash2,
  Type as TypeIcon,
} from "lucide-react";
import { computeBookmarksMetadata, truncateListName } from "../lib/utils";
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
import {
  deleteBookmarkListAction,
  changeBookmarkListVisibilityAction,
  renameBookmarkListAction,
} from "../server/actions";
import { toast } from "sonner";
import { SavedActivitiesResponse, BookmarksMetadata } from "../constants/types";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input } from "@/components/ui/input";
import { LIST_NAME_MAX_LENGTH } from "../constants/constants";
import { SelectVisibility } from "./SelectVisibility";
import { QR } from "./QR";

export const ListFolder = ({
  listName,
  visibility,
  BETTER_AUTH_URL,
  listId,
  metadata,
  setChosenList,
}: {
  listName: string;
  listId: string;
  BETTER_AUTH_URL: string;
  visibility: "public" | "private";
  metadata: BookmarksMetadata;
  setChosenList: Dispatch<
    SetStateAction<{
      id: string;
      visibility: "public" | "private";
      listName: string;
    } | null>
  >;
}) => {
  const queryClient = useQueryClient();
  const mutationKey = ["delete_bookmark_list", listName, visibility];
  const [isDeleteAlertDialogOpen, setIsDeleteAlertDialogOpen] = useState(false);
  const [isRenameAlertDialogOpen, setIsRenameAlertDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState(listName);
  const allListNameUnderCurrentVisibility = useMemo(() => {
    return Object.keys(metadata[visibility]).map(
      (listId) => metadata[visibility][listId].listName
    );
  }, [metadata, visibility]);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [changeVisibilityError, setChangeVisibilityError] = useState<
    string | null
  >(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isBlockingInput, setIsBlockingInput] = useState(false);
  const [newVisibility, setNewVisibility] = useState<"public" | "private">(
    visibility
  );
  const allListNameUnderNewVisibility = useMemo(() => {
    return Object.keys(metadata[newVisibility]).map(
      (listId) => metadata[newVisibility][listId].listName
    );
  }, [metadata, newVisibility]);
  const [
    isChangeVisibilityAlertDialogOpen,
    setIsChangeVisibilityAlertDialogOpen,
  ] = useState(false);
  const { mutate: deleteList } = useMutation({
    mutationKey,
    mutationFn: async ({ realListId }: { realListId: string }) => {
      const result = await deleteBookmarkListAction({
        listId: realListId,
      });
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: (
      _,
      {
        realListId,
      }: { realListId: string; realVisibility: "public" | "private" }
    ) => {
      toast.success("List deleted successfully");
      setIsDeleteAlertDialogOpen(false);
      queryClient.setQueryData<SavedActivitiesResponse>(
        ["user_saved_activities"],
        (prev: SavedActivitiesResponse | undefined) => {
          if (!prev) {
            return prev;
          }
          const next = prev.bookmarks.filter(
            (bookmark) => !(bookmark.id === realListId)
          );
          const updatedBookmarksMetadata = computeBookmarksMetadata(next);
          return {
            ...prev,
            bookmarks: next,
            metadata: {
              ...prev.metadata,
              bookmarks: updatedBookmarksMetadata,
            },
          };
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

  const { mutate: renameList } = useMutation({
    mutationKey,
    mutationFn: async ({
      realListId,
      realNewName,
    }: {
      realListId: string;
      realNewName: string;
    }) => {
      const result = await renameBookmarkListAction({
        listId: realListId,
        newName: realNewName,
      });
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: (
      _,
      { realListId, realNewName }: { realListId: string; realNewName: string }
    ) => {
      toast.success("List renamed successfully");
      setIsRenameAlertDialogOpen(false);
      queryClient.setQueryData<SavedActivitiesResponse>(
        ["user_saved_activities"],
        (prev: SavedActivitiesResponse | undefined) => {
          if (!prev) {
            return prev;
          }
          setNewListName("");
          setIsRenameAlertDialogOpen(false);
          const next = prev.bookmarks.map((bookmark) => {
            if (bookmark.id === realListId) {
              return { ...bookmark, listName: realNewName };
            }
            return bookmark;
          });
          const updatedBookmarksMetadata = computeBookmarksMetadata(next);
          return {
            ...prev,
            bookmarks: next,
            metadata: {
              ...prev.metadata,
              bookmarks: updatedBookmarksMetadata,
            },
          };
        }
      );
    },
    onError: (error) => {
      toast.error(
        "Failed to rename bookmark list: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    },
    retry: false,
  });

  const { mutate: changeVisibility } = useMutation({
    mutationKey,
    mutationFn: async ({
      realListId,
      realNewVisibility,
    }: {
      realListId: string;
      realNewVisibility: "public" | "private";
    }) => {
      const result = await changeBookmarkListVisibilityAction({
        listId: realListId,
        newVisibility: realNewVisibility,
      });
      if (result.error) {
        throw new Error(result.error);
      }
    },
    onSuccess: (
      _,
      {
        realListId,
        realNewVisibility,
      }: { realListId: string; realNewVisibility: "public" | "private" }
    ) => {
      toast.success("List visibility changed successfully");
      setIsRenameAlertDialogOpen(false);
      queryClient.setQueryData<SavedActivitiesResponse>(
        ["user_saved_activities"],
        (prev: SavedActivitiesResponse | undefined) => {
          if (!prev) {
            return prev;
          }
          setNewListName("");
          setIsRenameAlertDialogOpen(false);
          const next = prev.bookmarks.map((bookmark) => {
            if (bookmark.id === realListId) {
              return { ...bookmark, visibility: realNewVisibility };
            }
            return bookmark;
          });
          const updatedBookmarksMetadata = computeBookmarksMetadata(next);
          return {
            ...prev,
            bookmarks: next,
            metadata: {
              ...prev.metadata,
              bookmarks: updatedBookmarksMetadata,
            },
          };
        }
      );
    },
    onError: (error) => {
      toast.error(
        "Failed to change visibility of bookmark list: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    },
    retry: false,
  });

  useEffect(() => {
    setChangeVisibilityError(null);
  }, [newVisibility]);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const isMutatingThisList = useIsMutating({ mutationKey }) > 0;

  return (
    <>
      <div
        className="flex flex-row gap-2 bg-[#f0f4f9] w-[250px] p-2 rounded-sm items-center justify-between"
        title={listName}
        onClick={() => {
          setChosenList({
            id: listId,
            visibility,
            listName,
          });
        }}
      >
        <div className="flex flex-row gap-4 items-center justify-center">
          <Folder className="!text-black" fill="black" />
          <h3 className=" text-lg text-black">
            {truncateListName({ listName })}
          </h3>
        </div>
        <Popover>
          <PopoverTrigger
            className="cursor-pointer"
            disabled={isMutatingThisList}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <EllipsisVertical size={18} className="!text-black" />
          </PopoverTrigger>
          <PopoverContent className="!p-2 w-[190px] gap-2 flex flex-col items-center justify-center">
            <AlertDialog
              open={isDeleteAlertDialogOpen}
              onOpenChange={setIsDeleteAlertDialogOpen}
            >
              <AlertDialogTrigger
                className="flex flex-row gap-2 items-center justify-start w-full hover:bg-muted-foreground/10 p-1 rounded-md cursor-pointer"
                disabled={isMutatingThisList}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash2 className="text-red-500" /> Remove list
              </AlertDialogTrigger>
              <AlertDialogContent
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you absolutely sure you want to delete this list?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All bookmark saved in this
                    list will be deleted.
                  </AlertDialogDescription>
                  <p>List name: {listName}</p>
                  <p>Visibility: {visibility}</p>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="cursor-pointer"
                    disabled={isMutatingThisList}
                  >
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
            <AlertDialog
              open={isRenameAlertDialogOpen}
              onOpenChange={(value) => {
                setIsRenameAlertDialogOpen(value);
                if (value === true) {
                  setTimeout(() => {
                    inputRef.current?.focus();
                  }, 0);
                }
              }}
            >
              <AlertDialogTrigger
                className="flex flex-row gap-2 items-center justify-start w-full hover:bg-muted-foreground/10 p-1 rounded-md cursor-pointer"
                disabled={isMutatingThisList}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <TypeIcon /> Rename list
              </AlertDialogTrigger>
              <AlertDialogContent
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Rename this list</AlertDialogTitle>
                  <AlertDialogDescription className="sr-only">
                    Rename this list
                  </AlertDialogDescription>
                  <p>Current list name: {listName}</p>
                  <p>Visibility: {visibility}</p>
                </AlertDialogHeader>
                <Input
                  ref={inputRef}
                  disabled={isBlockingInput}
                  placeholder="New list name"
                  value={newListName}
                  onChange={(e) => {
                    setNewListName(e.target.value);
                    if (e.target.value.trim().length > LIST_NAME_MAX_LENGTH) {
                      setRenameError(
                        `List name cannot be longer than ${LIST_NAME_MAX_LENGTH} characters`
                      );
                    } else {
                      setRenameError(null);
                    }
                  }}
                />
                {renameError && (
                  <p className="text-red-500 text-xs">{renameError}</p>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="cursor-pointer"
                    disabled={isMutatingThisList}
                    onClick={() => {
                      setIsBlockingInput(true);
                      setTimeout(() => {
                        setIsBlockingInput(false);
                      }, 0);
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    className="cursor-pointer"
                    disabled={isMutatingThisList}
                    onClick={() => {
                      if (newListName.trim() === listName) {
                        setRenameError(
                          "You are not allowed to rename to the same name"
                        );
                        return;
                      } else if (
                        allListNameUnderCurrentVisibility.includes(
                          newListName.trim()
                        )
                      ) {
                        setRenameError(
                          "List name already exists with same visibility"
                        );
                        return;
                      } else if (newListName.trim() === "") {
                        setRenameError("List name cannot be empty");
                        return;
                      } else if (
                        newListName.trim().length > LIST_NAME_MAX_LENGTH
                      ) {
                        setRenameError(
                          `List name cannot be longer than ${LIST_NAME_MAX_LENGTH} characters`
                        );
                        return;
                      } else {
                        renameList({
                          realListId: listId,
                          realNewName: newListName.trim(),
                        });
                      }
                    }}
                  >
                    Rename
                    {isMutatingThisList && <Loader2 className="animate-spin" />}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog
              open={isChangeVisibilityAlertDialogOpen}
              onOpenChange={setIsChangeVisibilityAlertDialogOpen}
            >
              <AlertDialogTrigger
                className="flex flex-row gap-2 items-center justify-start w-full hover:bg-muted-foreground/10 p-1 rounded-md cursor-pointer"
                disabled={isMutatingThisList}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Telescope /> Change visibility
              </AlertDialogTrigger>
              <AlertDialogContent
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Change visibility</AlertDialogTitle>
                  <AlertDialogDescription className="sr-only">
                    Change visibility
                  </AlertDialogDescription>
                  <p>Current list name: {listName}</p>
                  <p>Visibility: {visibility}</p>
                </AlertDialogHeader>
                <SelectVisibility
                  isMutatingThisQuestion={isMutatingThisList}
                  visibility={newVisibility}
                  setVisibility={setNewVisibility}
                />
                {changeVisibilityError && (
                  <p className="text-red-500 text-xs">
                    {changeVisibilityError}
                  </p>
                )}
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="cursor-pointer"
                    disabled={isMutatingThisList}
                    onClick={() => {
                      setIsBlockingInput(true);
                      setTimeout(() => {
                        setIsBlockingInput(false);
                      }, 0);
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    className="cursor-pointer"
                    disabled={isMutatingThisList}
                    onClick={() => {
                      if (newVisibility === visibility) {
                        setChangeVisibilityError(
                          "You are not allowed to change to the same visibility"
                        );
                        return;
                      }
                      if (allListNameUnderNewVisibility.includes(listName)) {
                        setChangeVisibilityError(
                          "List name already exists with same visibility"
                        );
                        return;
                      }
                      changeVisibility({
                        realListId: listId,
                        realNewVisibility: newVisibility,
                      });
                    }}
                  >
                    Change visibility
                    {isMutatingThisList && <Loader2 className="animate-spin" />}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {visibility === "public" && (
              <div
                className="flex flex-row gap-2 items-center justify-start w-full hover:bg-muted-foreground/10 p-1 rounded-md cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsQRDialogOpen(true);
                }}
              >
                <Send /> Share list
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
      <QR
        isOpen={isQRDialogOpen && visibility === "public"}
        setIsOpen={setIsQRDialogOpen}
        url={`${BETTER_AUTH_URL}/topical/bookmark/${listId}`}
      />
    </>
  );
};
