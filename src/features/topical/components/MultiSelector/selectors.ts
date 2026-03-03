import type { CIE_A_LEVEL_SUBDIVISION, OUTDATED } from "@/constants/types";
import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

export interface EnhancedSelectAvailableOptions {
  value: string;
  curriculumnSubdivision: (CIE_A_LEVEL_SUBDIVISION | OUTDATED)[];
  isUpToDate: boolean;
}

export type VALID_LABEL = "Curriculum" | "Subject" | "Topic" | "Year" | "Paper" | "Season";

export interface EnhancedSelectContentRef {
  setInputValue: Dispatch<SetStateAction<string>>;
}

export interface MultiSelectorProps {
  selectedValues: string[];
  onValuesChange: (value: string[]) => void;
  allAvailableOptions: string[];
  maxLength?: number;
  label: VALID_LABEL;
}

export interface EnhancedMultiSelectorProps {
  currentFilter: CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined;
  setCurrentFilter: Dispatch<SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>>;
  isMounted: boolean;
  selectedValues: string[];
  onValuesChange: (value: string[]) => void;
  allAvailableOptions: EnhancedSelectAvailableOptions[];
  maxLength?: number;
  label: VALID_LABEL;
}

export interface MultiSelectorSharedProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  allAvailableOptions: string[];
  label: string;
  maxLength: number | undefined;
  inputRef: RefObject<HTMLInputElement | null>;
}

export interface EnhancedMultiSelectorSharedProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  allAvailableOptions: EnhancedSelectAvailableOptions[];
  currentFilter: CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined;
  setCurrentFilter: Dispatch<SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>>;
  allValue: string[];
  label: string;
  maxLength: number | undefined;
  allFilterOptions: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  onDeleteAll: () => void;
  onSelectAll: () => void;
}

export interface MultiSelectorContentProps {
  inputRef: RefObject<HTMLInputElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  multiSelectorListRef: RefObject<MultiSelectorListRef | null>;
  children: ReactNode;
}

export interface MultiSelectorListRef {
  setInputValue: Dispatch<SetStateAction<string>>;
  inputValue: string;
}

export interface MultiSelectorListProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  allAvailableOptions: string[];
  setOpen: (open: boolean) => void;
  maxLength: number | undefined;
}

export interface EnhancedMultiSelectorListProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  currentFilter: CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined;
  setCurrentFilter: Dispatch<SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>>;
  allFilterOptions: string[];
  allAvailableOptions: EnhancedSelectAvailableOptions[];
  setOpen: (open: boolean) => void;
  maxLength: number | undefined;
}

export interface MultiSelectorTriggerButtonUltilityProps {
  onValueChange: (val: string | string[]) => void;
  mousePreventDefault: (e: React.MouseEvent) => void;
  setIsClickingUltility: Dispatch<SetStateAction<boolean>>;
  allAvailableOptions: string[];
  maxLength: number | undefined;
  showSelectAll: boolean;
  showDeleteAll: boolean;
}

export interface MultiSelectorSearchInputProps {
  inputValue: string;
  isBlockingMobileKeyboard: boolean;
  setInputValue: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  setOpen: (open: boolean) => void;
  commandListScrollArea: RefObject<HTMLDivElement | null>;
}

export interface MultiSelectorTriggerProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  allAvailableOptions: string[];
  label: string;
  setInputValue: Dispatch<SetStateAction<string>> | undefined;
  maxLength: number | undefined;
  showSelectAll?: boolean;
  showDeleteAll?: boolean;
}

export interface MultiSelectContextProps {
  value: string[];
  onValueChange: (value: string | string[]) => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  inputRef: RefObject<HTMLInputElement | null>;
  commandListScrollArea: RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  label: VALID_LABEL;
  prerequisite: string;
  isMobileDevice: boolean;
  maxLength?: number;
}
