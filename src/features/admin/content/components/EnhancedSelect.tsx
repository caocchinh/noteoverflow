import { useState, useRef, useMemo } from "react";
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
import { Check, Plus, X, Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const filteredExistingItems = useMemo(() => {
    return searchQuery
      ? existingItems.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : existingItems;
  }, [existingItems, searchQuery]);

  const filteredNewItems = useMemo(() => {
    return searchQuery
      ? newItems.filter((item) =>
          item.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : newItems;
  }, [newItems, searchQuery]);

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
          >
            <SelectValue
              placeholder={isLoading ? loadingPlaceholder : placeholder}
            />
          </SelectTrigger>
          <SelectContent>
            <div className="flex items-center border-b p-2 sticky top-0  z-10">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation();
                }}
                className="border-0 focus-visible:ring-0 !px-3 focus-visible:ring-offset-0 h-8 "
              />
              {searchQuery && (
                <div
                  className="cursor-pointer "
                  title="Clear search"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4 cursor-pointer text-muted-foreground hover:text-red-500" />
                </div>
              )}
            </div>

            <SelectGroup>
              <SelectLabel>{existingItemsLabel}</SelectLabel>
              {existingItems.map((item, index) => (
                <SelectItem
                  key={index}
                  value={item}
                  className={cn(
                    "hidden",
                    filteredExistingItems.includes(item) && "block"
                  )}
                >
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{newItemsLabel}</SelectLabel>
              {newItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 hover:bg-muted group cursor-pointer items-center justify-between rounded-md w-full",
                    filteredNewItems.includes(item) ? "flex" : "hidden"
                  )}
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

            {newItems.map((item, index) => (
              <SelectItem key={index} value={item} className="hidden">
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
