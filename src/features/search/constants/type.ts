import { CIE_A_LEVEL_SUBDIVISION } from "@/constants/types";
import { DisplayMode, SortParameters } from "@/features/topical/types/models";

import { Dispatch, RefObject, SetStateAction } from "react";

export type OptionalSearchFilter = {
  subject?: string;
  curriculum?: string;
  year?: string[];
  season?: string[];
  paperType?: string[];
};

export interface OptionalFiltersProps {
  currentFilter: OptionalSearchFilter | null;
  setCurrentFilter: Dispatch<SetStateAction<OptionalSearchFilter | null>>;
  searchButtonPortalRef: RefObject<HTMLDivElement | null>;
  onSearch: ({ filter }: { filter: OptionalSearchFilter | null }) => void;
  isSearching: boolean;
  isInputValid: boolean;
}

export interface SearchResultsHeaderProps {
  resultCount: number;
  displayMode: DisplayMode;
  setDisplayMode: Dispatch<SetStateAction<DisplayMode>>;
  currentTab: "text" | "image";
  onInspectOpen: () => void;
  isSticky: boolean;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
}

export type PaperTypeFilterSearchPageCache = {
  [curriculum: string]: {
    [subject: string]: CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined;
  };
};
