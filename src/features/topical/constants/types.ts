import { ValidCurriculum, ValidSeason } from "@/constants/types";

export interface TopicalData {
  curriculum: ValidCurriculum;
  coverImage: string;
  subject: {
    coverImage: string;
    code: string;
    topic: string[];
    year: number[];
    paperType: number[];
    season: ValidSeason[];
  }[];
}

export interface MultiSelectorProps {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  data?: string[];
  dir?: string;
  label: string;
  prerequisite: string;
}
export interface MultiSelectContextProps {
  value: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange: (value: any) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  removeAllValues: () => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  isClickingScrollArea: boolean;
  setIsClickingScrollArea: React.Dispatch<React.SetStateAction<boolean>>;
  commandListRef: React.RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  selectAllValues: () => void;
  isBlockingInput: boolean;
  setIsBlockingInput: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileKeyboardOpen: boolean;
  setIsMobileKeyboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shouldOpenDrawer: boolean;
  label: string;
  prerequisite: string;
  isCollapsibleOpen: boolean;
  setIsCollapsibleOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
