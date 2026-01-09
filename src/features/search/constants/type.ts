import { CIE_A_LEVEL_SUBDIVISION } from "@/constants/types";
import { RefObject, SetStateAction } from "react";

export type OptionalSearchFilter = {
  subject?: string;
  curriculum?: string;
  year?: string[];
  season?: string[];
  paperType?: string[];
};

export interface OptionalFiltersProps {
  currentFilter: OptionalSearchFilter | null;
  setCurrentFilter: React.Dispatch<SetStateAction<OptionalSearchFilter | null>>;
  searchButtonPortalRef: RefObject<HTMLDivElement | null>;
  onSearch: () => void;
  isSearching: boolean;
  isInputValid: boolean;
}

export type PaperTypeFilterSearchPageCache = {
  [curriculum: string]: {
    [subject: string]: CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined;
  };
};
