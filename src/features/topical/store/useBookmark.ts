import { createStore } from "zustand";
import type { SelectedBookmark } from "../constants/types";
import { RefObject } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

interface BookmarkAction {
  setIsBlockingInput: (value: boolean) => void;
  setSearchInput: (value: string) => void;
  setIsAddNewListDialogOpen: (value: boolean) => void;
  setNewBookmarkListNameInput: (value: string) => void;
  setIsInputError: (value: boolean) => void;
  addChosenBookmarkListName: (name: string) => void;
  removeChosenBookmarkListName: (name: string) => void;
  clearChosenBookmarkList: () => void;
  setNewBookmarkListName: (value: string) => void;
  setMutate: (mutate: MutateFunction) => void;
}

// Define the mutate function type
export type MutateFunction = UseMutateFunction<
  {
    userId: string;
    realQuestionId: string;
    realBookmarkListName: string;
    isRealBookmarked: boolean;
    isCreateNew: boolean;
  },
  Error,
  {
    realQuestionId: string;
    isRealBookmarked: boolean;
    realBookmarkListName: string;
    isCreateNew: boolean;
  },
  unknown
>;

interface BookmarkProps {
  isBookmarksFetching: boolean;
  questionId: string;
  badgeClassName?: string;
  popOverAlign?: "start" | "end";
  triggerButtonClassName?: string;
  isBookmarkError: boolean;
  isBookmarkDisabled: boolean;
  isValidSession: boolean;
  bookmarks: SelectedBookmark;
  chosenBookmarkListName: Set<string>;
  open?: boolean;
}

export interface BookmarkState extends BookmarkProps {
  /* UI/interaction state */
  isBlockingInput: boolean;
  searchInput: string;
  open: boolean;

  /* Data */
  newBookmarkListName: string;
  mutate: MutateFunction | null;

  /* Ref */
  searchInputRef: RefObject<HTMLInputElement | null> | undefined;
  scrollAreaRef: RefObject<HTMLDivElement | null> | undefined;

  /* Dialog / form helpers */
  isAddNewListDialogOpen: boolean;
  newBookmarkListNameInput: string;
  isInputError: boolean;

  /* ----- Actions ----- */
  actions: BookmarkAction;
}

const defaultState: Omit<BookmarkState, "actions"> = {
  /* UI/interaction state */
  isBlockingInput: false,
  searchInput: "",
  open: false,

  /* Data */
  newBookmarkListName: "",
  mutate: null,

  /* Ref */
  searchInputRef: undefined,
  scrollAreaRef: undefined,

  /* Dialog / form helpers */
  isAddNewListDialogOpen: false,
  newBookmarkListNameInput: "",
  isInputError: false,

  /* Misc flags, will be set by parent component at run time */
  isBookmarksFetching: false,
  isBookmarkError: false,
  isBookmarkDisabled: false,
  isValidSession: false,
  questionId: "",
  badgeClassName: "",
  popOverAlign: "end",
  triggerButtonClassName: "",
  bookmarks: [],
  chosenBookmarkListName: new Set<string>(),
};

export type BookmarkStore = ReturnType<typeof createBookmarkStore>;

const createBookmarkStore = (initProps?: Partial<BookmarkProps>) => {
  return createStore<BookmarkState>()((set) => ({
    ...defaultState,
    ...initProps,
    /* ---------- Actions ---------- */
    actions: {
      setIsBlockingInput: (value) => set({ isBlockingInput: value }),
      setSearchInput: (value) => set({ searchInput: value }),
      setIsAddNewListDialogOpen: (value) =>
        set({ isAddNewListDialogOpen: value }),
      setNewBookmarkListNameInput: (value) =>
        set({ newBookmarkListNameInput: value }),
      setIsInputError: (value) => set({ isInputError: value }),
      addChosenBookmarkListName: (name) =>
        set((state) => {
          const next = new Set(state.chosenBookmarkListName);
          next.add(name);
          return { chosenBookmarkListName: next };
        }),
      removeChosenBookmarkListName: (name) =>
        set((state) => {
          const next = new Set(state.chosenBookmarkListName);
          next.delete(name);
          return { chosenBookmarkListName: next };
        }),
      clearChosenBookmarkList: () => set({ chosenBookmarkListName: new Set() }),
      setNewBookmarkListName: (value) => set({ newBookmarkListName: value }),
      setMutate: (mutate) => set({ mutate }),
    },
  }));
};

export default createBookmarkStore;
