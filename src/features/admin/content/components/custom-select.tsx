import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Check, Plus, X } from "lucide-react";

interface CustomSelectProps {
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
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  selectedValue,
  onValueChange,
  isOpen,
  onOpenChange,
  existingItems,
  newItems,
  onAddNewItem,
  onRemoveNewItem,
  placeholder,
  loadingPlaceholder,
  isLoading,
  newItemInputValue,
  onNewItemInputChange,
  existingItemsLabel,
  newItemsLabel,
  inputPlaceholder,
  className = "w-max",
  disabled = false,
  error = null,
  validator,
}) => {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isItemDuplicate = (value: string) => {
    return [...existingItems, ...newItems].includes(value);
  };

  const validateInput = (value: string): string | null => {
    // First check for duplicates
    if (isItemDuplicate(value)) {
      return `"${value}" already exists`;
    }

    // Then run the custom validator if provided
    if (validator) {
      return validator(value);
    }

    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === "Enter" && newItemInputValue) {
      const validationResult = validateInput(newItemInputValue);

      if (!validationResult) {
        onAddNewItem(newItemInputValue);
        setDuplicateError(null);
        setValidationError(null);
      } else {
        if (isItemDuplicate(newItemInputValue)) {
          setDuplicateError(validationResult);
          setValidationError(null);
        } else {
          setDuplicateError(null);
          setValidationError(validationResult);
        }
      }
    }
  };

  const handleAddItem = () => {
    if (newItemInputValue) {
      const validationResult = validateInput(newItemInputValue);

      if (!validationResult) {
        onAddNewItem(newItemInputValue);
        setDuplicateError(null);
        setValidationError(null);
      } else {
        if (isItemDuplicate(newItemInputValue)) {
          setDuplicateError(validationResult);
          setValidationError(null);
        } else {
          setDuplicateError(null);
          setValidationError(validationResult);
        }
      }
    }
  };

  const handleInputChange = (value: string) => {
    if (duplicateError) {
      setDuplicateError(null);
    }

    if (validator && value) {
      const validationResult = validator(value);
      setValidationError(validationResult);
    } else {
      setValidationError(null);
    }

    onNewItemInputChange(value);
  };

  return (
    <div className="flex flex-col gap-1">
      <Select
        onValueChange={onValueChange}
        value={selectedValue}
        open={isOpen}
        onOpenChange={onOpenChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger
          className={`${className} ${
            error || duplicateError || validationError ? "border-red-500" : ""
          }`}
        >
          <SelectValue
            placeholder={isLoading ? loadingPlaceholder : placeholder}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{existingItemsLabel}</SelectLabel>
            {existingItems.map((item, index) => (
              <SelectItem key={index} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>{newItemsLabel}</SelectLabel>
            {newItems.map((item, index) => (
              <div
                key={index}
                className="p-2 hover:bg-muted group cursor-pointer flex items-center justify-between rounded-md w-full"
              >
                <div
                  className="flex-1"
                  onClick={() => {
                    onValueChange(item);
                    onOpenChange(false);
                  }}
                >
                  {item}
                </div>
                <div className="flex items-center gap-2">
                  <X
                    className="w-4 h-4 group-hover:block hidden"
                    onClick={() => {
                      onRemoveNewItem(index);
                    }}
                  />
                  <Check
                    className={`w-4 h-4 group-hover:hidden ${
                      selectedValue === item ? "block" : "hidden"
                    }`}
                    onClick={() => {
                      onValueChange(item);
                    }}
                  />
                </div>
              </div>
            ))}
          </SelectGroup>
          {newItems.map((item, index) => (
            <SelectItem key={index} value={item} className="hidden">
              {item}
            </SelectItem>
          ))}

          <div className="flex items-start gap-2 p-2 mt-2 flex-col">
            <div className="flex items-center gap-2">
              <Input
                placeholder={inputPlaceholder}
                value={newItemInputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                className={
                  error || duplicateError || validationError
                    ? "border-red-500"
                    : ""
                }
                onKeyDown={handleKeyDown}
              />
              <div
                className="cursor-pointer"
                title={`Add new ${inputPlaceholder
                  .toLowerCase()
                  .replace("Enter new ", "")
                  .replace(" name", "")}`}
              >
                <Plus
                  className={`w-4 h-4 ${
                    error || duplicateError || validationError
                      ? "text-red-500"
                      : ""
                  }`}
                  onClick={handleAddItem}
                />
              </div>
            </div>
            {(error || duplicateError || validationError) && (
              <p className="text-red-500 text-xs mt-1">
                {duplicateError || validationError || error}
              </p>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CustomSelect;
