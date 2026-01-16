import { InvalidInputs } from "@/features/topical/constants/types";
import { Dispatch, RefObject, SetStateAction } from "react";

export interface PaperFormState {
  curriculum: string;
  subject: string;
  paperType: string;
  variant: string;
  season: string;
  year: string;
  quickCode: string;
}

export interface InvalidInputsWithVariant extends InvalidInputs {
  variant: boolean;
}

export interface SubjectOption {
  code: string;
  coverImage: string;
  topic?: unknown[];
  year?: unknown[];
  paperType?: unknown[];
  season?: unknown[];
}

export type PaperLinkType = "qp" | "ms" | "er" | "gt";

export interface ManualInputFormProps {
  selectedCurriculum: string;
  setSelectedCurriculum: Dispatch<SetStateAction<string>>;
  selectedSubject: string;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  selectedPaperType: string;
  setSelectedPaperType: Dispatch<SetStateAction<string>>;
  selectedVariant: string;
  setSelectedVariant: Dispatch<SetStateAction<string>>;
  selectedSeason: string;
  setSelectedSeason: Dispatch<SetStateAction<string>>;
  selectedYear: string;
  setSelectedYear: Dispatch<SetStateAction<string>>;
  invalidInputs: InvalidInputsWithVariant;
  currentYear: number;
  onFindPaper: () => void;
  onClearEverything: () => void;
  onClose: () => void;
}

export interface PaperDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCurriculum: string;
  selectedSubject: string;
  selectedPaperType: string;
  selectedVariant: string;
  selectedSeason: string;
  selectedYear: string;
  quickCodeInput: string;
  parseLink: (params: { type: PaperLinkType }) => string;
  onClearEverything: () => void;
  markingSchemeButtonRef: RefObject<HTMLAnchorElement | null>;
}

export interface QuickCodeSectionProps {
  value: string;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export interface SeasonSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export interface NumberInputWithControlsProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  placeholder?: string;
  label?: string;
  error?: string | null;
}
