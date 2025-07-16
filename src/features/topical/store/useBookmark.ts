import { createStore } from "zustand";
import type { SelectedBookmark } from "../constants/types";

interface BookmarkAction {
  setIsBlockingInput: (value: boolean) => void;
  setSearchInput: (value: string) => void;
  setOpen: (value: boolean) => void;
  setIsAddNewListDialogOpen: (value: boolean) => void;
  setNewBookmarkListNameInput: (value: string) => void;
  setIsInputError: (value: boolean) => void;
  addChosenBookmarkListName: (name: string) => void;
  removeChosenBookmarkListName: (name: string) => void;
  clearChosenBookmarkList: () => void;
}

interface BookmarkProps {
  isBookmarksFetching: boolean;
  questionId: string;
  badgeClassName?: string;
  triggerButtonClassName?: string;
  isBookmarkError: boolean;
  isBookmarkDisabled: boolean;
  isValidSession: boolean;
  bookmarks: SelectedBookmark;
}

export interface BookmarkState extends BookmarkProps {
  /* UI/interaction state */
  isBlockingInput: boolean;
  searchInput: string;
  open: boolean;

  /* Data */
  chosenBookmarkListName: Set<string>;

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
  chosenBookmarkListName: new Set<string>(),

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
  triggerButtonClassName: "",
  bookmarks: [],
};

const createBookmarkStore = (initProps?: Partial<BookmarkProps>) => {
  return createStore<BookmarkState>()((set) => ({
    ...defaultState,
    ...initProps,
    /* ---------- Actions ---------- */
    actions: {
      setIsBlockingInput: (value) => set({ isBlockingInput: value }),
      setSearchInput: (value) => set({ searchInput: value }),
      setOpen: (value) => {
        set({ open: value });
        if (!value) {
          set({ newBookmarkListNameInput: "" });
        }
      },
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
    },
  }));
};

export default createBookmarkStore;
