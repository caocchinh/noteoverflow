import { InferSelectModel } from "drizzle-orm";
import { curriculum, subject } from "@/drizzle/schema";

export type CurriculumType = InferSelectModel<typeof curriculum>;
export type SubjectType = InferSelectModel<typeof subject>;

export interface EnhancedSelectProps {
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingItems: string[];
  newItems: string[];
  onAddNewItem: (item: string) => void;
  onRemoveNewItem: (index: number) => void;
  placeholder: string;
  loadingPlaceholder?: string;
  isLoading?: boolean;
  newItemInputValue: string;
  onNewItemInputChange: (value: string) => void;
  existingItemsLabel: string;
  newItemsLabel: string;
  inputPlaceholder: string;
  valueKey?: string;
  nameKey?: string;
  className?: string;
  disabled?: boolean;
  error?: string | null;
  validator?: (value: string) => string | null;
  label: string;
}
