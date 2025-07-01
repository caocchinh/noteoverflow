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

export type VALID_LABEL =
  | "Curriculum"
  | "Subject"
  | "Topic"
  | "Year"
  | "Paper"
  | "Season";

export interface MultiSelectorProps {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  data?: string[];
  dir?: string;
  label: VALID_LABEL;
  prerequisite: string;
}

export interface MultiSelectContextProps {
  value: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange: (value: any, option?: "selectAll" | "removeAll") => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  inputValue: string;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  isClickingScrollArea: boolean;
  setIsClickingScrollArea: React.Dispatch<React.SetStateAction<boolean>>;
  commandListRef: React.RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  isBlockingInput: boolean;
  setIsBlockingInput: React.Dispatch<React.SetStateAction<boolean>>;
  label: VALID_LABEL;
  prerequisite: string;
  isCollapsibleOpen: boolean;
  setIsCollapsibleOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDevice: boolean;
}
