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
  isBookmarksFetching: boolean;
  isBookmarkDisabled: boolean;
  isBookmarkError: boolean;
  isValidSession: boolean;
  isBlockingInput: boolean;
  isInputError: boolean;
  isAddNewListDialogOpen: boolean;
  visibility: "public" | "private";
  question: SelectedQuestion;
  bookmarkListName: string;
  newBookmarkListNameInput: string;
  searchInput: string;
  bookmarks: SelectedBookmark[];
  chosenBookmarkListName: Set<string>;
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
    addChosenBookmarkListName: (value: string) => void;
    removeChosenBookmarkListName: (value: string) => void;
    setMutate: (mutate: MutateFunction | null) => void;
    setBookmarkListName: (value: string) => void;
    setNewBookmarkListNameInput: (value: string) => void;
    setIsInputError: (value: boolean) => void;
    setIsAddNewListDialogOpen: (value: boolean) => void;
    setVisibility: (value: "public" | "private") => void;
  };
};

export type BookmarkProps = {
  isBookmarksFetching: boolean;
  isBookmarkDisabled: boolean;
  isBookmarkError: boolean;
  isValidSession: boolean;
  question: SelectedQuestion;
  chosenBookmarkListName: Set<string>;
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
    isBookmarksFetching: props.isBookmarksFetching,
    isBookmarkDisabled: props.isBookmarkDisabled,
    isBookmarkError: props.isBookmarkError,
    isValidSession: props.isValidSession,
    isBlockingInput: false,
    isInputError: false,
    isAddNewListDialogOpen: false,
    visibility: "private",
    question: props.question,
    bookmarkListName: "",
    newBookmarkListNameInput: "",
    searchInput: "",
    bookmarks: props.bookmarks,
    chosenBookmarkListName: props.chosenBookmarkListName,
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
      addChosenBookmarkListName: (value: string) =>
        set((state) => {
          state.chosenBookmarkListName.add(value);
          return {
            ...state,
            chosenBookmarkListName: new Set(state.chosenBookmarkListName),
          };
        }),
      removeChosenBookmarkListName: (value: string) =>
        set((state) => {
          state.chosenBookmarkListName.delete(value);
          return {
            ...state,
            chosenBookmarkListName: new Set(state.chosenBookmarkListName),
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
      setVisibility: (value: "public" | "private") =>
        set((state) => ({
          ...state,
          visibility: value,
        })),
    },
  }));
};

export default createBookmarkStore;
