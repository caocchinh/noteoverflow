import { create } from "zustand";
import { SelectedBookmark, SelectedQuestion } from "../constants/types";

// Define a type for the mutation function
type MutateFunction = (params: {
  realQuestion: SelectedQuestion;
  realBookmarkListName: string;
  realListId: string;
  isRealBookmarked: boolean;
  isCreateNew: boolean;
  realVisibility: "public" | "private";
}) => Promise<unknown> | void;

export type BookmarkState = {
  isBookmarkDisabled: boolean;
  isBlockingInput: boolean;
  isInputError: boolean;
  isAddNewListDialogOpen: boolean;
  isRemoveFromListDialogOpen: boolean;
  visibility: "public" | "private";
  question: SelectedQuestion;
  listId?: string;
  bookmarkListName: string;
  newBookmarkListNameInput: string;
  searchInput: string;
  bookmarks: SelectedBookmark[];
  chosenBookmarkList: Set<string>;
  popOverAlign: "start" | "end";
  badgeClassName?: string;
  popOverTriggerClassName?: string;
  triggerButtonClassName?: string;
  open: boolean;
  isInView: boolean; // Add isInView property
  mutate: MutateFunction | null;
  scrollAreaRef: React.RefObject<HTMLDivElement | null> | null;
  searchInputRef: React.RefObject<HTMLInputElement | null> | null;
  actions: {
    setIsBlockingInput: (value: boolean) => void;
    setIsHovering?: (value: boolean) => void;
    setSearchInput: (value: string) => void;
    addChosenBookmarkList: (value: string) => void;
    removeChosenBookmarkList: (value: string) => void;
    setMutate: (mutate: MutateFunction | null) => void;
    setBookmarkListName: (value: string) => void;
    setNewBookmarkListNameInput: (value: string) => void;
    setIsInputError: (value: boolean) => void;
    setIsAddNewListDialogOpen: (value: boolean) => void;
    setIsRemoveFromListDialogOpen: (value: boolean) => void;
    setVisibility: (value: "public" | "private") => void;
  };
};

export type BookmarkProps = {
  isBookmarkDisabled: boolean;
  listId?: string;
  question: SelectedQuestion;
  chosenBookmarkList: Set<string>;
  bookmarks: SelectedBookmark[];
  popOverAlign?: "start" | "end";
  badgeClassName?: string;
  popOverTriggerClassName?: string;
  triggerButtonClassName?: string;
  open: boolean;
  isInView: boolean; // Add isInView property
};

export type BookmarkStore = ReturnType<typeof createBookmarkStore>;

const createBookmarkStore = (props: BookmarkProps) => {
  return create<BookmarkState>()((set) => ({
    isBookmarkDisabled: props.isBookmarkDisabled,
    listId: props.listId ?? "",
    isBlockingInput: false,
    isInputError: false,
    isAddNewListDialogOpen: false,
    isRemoveFromListDialogOpen: false,
    visibility: "private",
    question: props.question,
    bookmarkListName: "",
    newBookmarkListNameInput: "",
    searchInput: "",
    bookmarks: props.bookmarks,
    chosenBookmarkList: props.chosenBookmarkList,
    popOverAlign: props.popOverAlign ?? "end",
    badgeClassName: props.badgeClassName,
    popOverTriggerClassName: props.popOverTriggerClassName,
    triggerButtonClassName: props.triggerButtonClassName,
    open: props.open,
    isInView: props.isInView, // Initialize isInView
    mutate: null,
    scrollAreaRef: null,
    searchInputRef: null,
    actions: {
      setIsBlockingInput: (value: boolean) =>
        set((state) => ({
          ...state,
          isBlockingInput: value,
        })),
      setIsHovering: (value: boolean) =>
        set((state) => ({
          ...state,
          isHovering: value,
        })),
      setSearchInput: (value: string) =>
        set((state) => ({
          ...state,
          searchInput: value,
        })),
      addChosenBookmarkList: (value: string) =>
        set((state) => {
          state.chosenBookmarkList.add(value);
          return {
            ...state,
            chosenBookmarkList: new Set(state.chosenBookmarkList),
          };
        }),
      removeChosenBookmarkList: (value: string) =>
        set((state) => {
          state.chosenBookmarkList.delete(value);
          return {
            ...state,
            chosenBookmarkList: new Set(state.chosenBookmarkList),
          };
        }),
      setMutate: (mutate: MutateFunction | null) =>
        set((state) => ({
          ...state,
          mutate,
        })),
      setBookmarkListName: (value: string) =>
        set((state) => ({
          ...state,
          bookmarkListName: value,
        })),
      setNewBookmarkListNameInput: (value: string) =>
        set((state) => ({
          ...state,
          newBookmarkListNameInput: value,
        })),
      setIsInputError: (value: boolean) =>
        set((state) => ({
          ...state,
          isInputError: value,
        })),
      setIsAddNewListDialogOpen: (value: boolean) =>
        set((state) => ({
          ...state,
          isAddNewListDialogOpen: value,
        })),
      setIsRemoveFromListDialogOpen: (value: boolean) =>
        set((state) => ({
          ...state,
          isRemoveFromListDialogOpen: value,
        })),
      setVisibility: (value: "public" | "private") =>
        set((state) => ({
          ...state,
          visibility: value,
        })),
    },
  }));
};

export default createBookmarkStore;
