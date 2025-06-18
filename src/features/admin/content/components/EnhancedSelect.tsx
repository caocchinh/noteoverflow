import { useState, useRef } from "react";
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
import { EnhancedSelectProps } from "../constants/types";
import { cn } from "@/lib/utils";

const EnhancedSelect = ({
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
  className = "",
  disabled = false,
  error = null,
  validator,
  label,
}: EnhancedSelectProps) => {
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  const handleWrapperClick = () => {
    if (isOpen || disabled || isLoading) return;

    onOpenChange(true);
  };

  return (
    <div className="w-full" ref={wrapperRef} onClick={handleWrapperClick}>
      <h5 className="block text-sm font-medium mb-1">{label}</h5>
      <div className="relative">
        <Select
          open={isOpen}
          onOpenChange={onOpenChange}
          value={selectedValue}
          onValueChange={onValueChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger
            className={cn(
              className,
              "cursor-pointer",
              error || duplicateError || validationError ? "border-red-500" : ""
            )}
            ref={triggerRef}
          >
            <SelectValue
              placeholder={isLoading ? loadingPlaceholder : placeholder}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>{existingItemsLabel}</SelectLabel>
              {existingItems.map((item, index) => (
                <SelectItem key={`existing-${index}-${item}`} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{newItemsLabel}</SelectLabel>
              {newItems.map((item, index) => (
                <div
                  key={`new-${index}-${item}`}
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
                      onClick={(e) => {
                        e.stopPropagation();
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

            {/* These hidden items ensure new items are properly registered in the Select */}
            {newItems.map((item, index) => (
              <SelectItem
                key={`hidden-${index}-${item}`}
                value={item}
                className="hidden"
              >
                {item}
              </SelectItem>
            ))}

            <div className="flex items-start gap-2 p-2 mt-2 flex-col">
              <div className="flex items-center gap-2 w-full">
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
    </div>
  );
};

export default EnhancedSelect;
