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
import { Check, Plus, X, Search } from "lucide-react";
import { EnhancedSelectProps } from "../constants/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const EnhancedSelect = ({
  selectedValue,
  onValueChange,
  existingItems,
  placeholders,
  labels,
  isLoading,
  className = "w-full",
  disabled = false,
  validator,
  inputType = "text",
}: EnhancedSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newItemInputValue, setNewItemInputValue] = useState<string>("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleAddNewItem = (item: string) => {
    setNewItems([...newItems, item]);
    setNewItemInputValue("");
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
    if (selectedValue === newItems[index]) {
      onValueChange("");
    }
  };

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
        handleAddNewItem(newItemInputValue);
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
        handleAddNewItem(newItemInputValue);
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

    setNewItemInputValue(value);
  };

  const handleWrapperClick = () => {
    if (isOpen || disabled || isLoading) return;

    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isInputFocused) return;
    setIsOpen(open);
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
      <h5 className="block text-sm font-medium mb-1">{labels.label}</h5>
      <div className="relative">
        <Select
          open={isOpen}
          onOpenChange={handleOpenChange}
          value={selectedValue}
          onValueChange={onValueChange}
          disabled={disabled || isLoading}
        >
          <SelectTrigger className={cn(className, "cursor-pointer")}>
            <SelectValue
              placeholder={
                isLoading
                  ? placeholders.loading
                  : disabled
                  ? placeholders.first
                  : placeholders.input
              }
            />
          </SelectTrigger>
          <SelectContent
            className="!z-[99999999999999999] max-w-[320px] sm:max-w-[620px]"
            onCloseAutoFocus={(e) => {
              if (isInputFocused) {
                e.preventDefault();
              }
            }}
            onEscapeKeyDown={(e) => {
              if (isInputFocused) {
                e.stopPropagation();
                e.preventDefault();
              }
            }}
            onPointerDownOutside={(e) => {
              if (isInputFocused) {
                e.preventDefault();
              }
            }}
          >
            <div className="flex items-center border-b p-2 w-full">
              <Search className="w-4 h-4 mr-2 text-muted-foreground" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                className="border-0 outline-none flex-grow px-3 h-8"
                onFocus={(e) => {
                  e.stopPropagation();
                  setIsInputFocused(true);
                }}
                onBlur={(e) => {
                  e.stopPropagation();
                  setIsInputFocused(false);
                }}
              />
              {searchQuery && (
                <div
                  className="cursor-pointer "
                  title="Clear search"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4 ml-2 cursor-pointer text-muted-foreground hover:text-red-500" />
                </div>
              )}
            </div>

            <SelectGroup>
              <SelectLabel>{labels.existingItems}</SelectLabel>
              {existingItems.map((item, index) => (
                <SelectItem
                  key={index}
                  value={item}
                  className={cn(
                    "hidden ",
                    filteredExistingItems.includes(item) && "block"
                  )}
                >
                  {item}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{labels.newItems}</SelectLabel>
              {newItems.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 hover:bg-muted group cursor-pointer  wrap-anywhere items-center justify-between rounded-md text-sm w-full",
                    filteredNewItems.includes(item) ? "flex" : "hidden"
                  )}
                  onClick={() => {
                    onValueChange(item);
                    setIsOpen(false);
                  }}
                >
                  {item}
                  <div className="flex items-center gap-2">
                    <X
                      className="w-4 h-4 group-hover:block hidden"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveNewItem(index);
                      }}
                    />
                    <Check
                      className={cn(
                        "w-4 h-4 group-hover:hidden",
                        selectedValue === item ? "block" : "hidden"
                      )}
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
                  placeholder={placeholders.input}
                  value={newItemInputValue}
                  type={inputType}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className={cn(
                    "flex-grow px-3 py-2 border rounded-md focus:outline-none",
                    duplicateError || validationError
                      ? "border-red-500"
                      : "border-input"
                  )}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setIsInputFocused(true);
                  }}
                  onBlur={(e) => {
                    e.stopPropagation();
                    setIsInputFocused(false);
                  }}
                />
                <div
                  className="cursor-pointer"
                  title={`Add new ${placeholders.input
                    .toLowerCase()
                    .replace("Enter new ", "")
                    .replace(" name", "")}`}
                >
                  <Plus
                    className={cn(
                      "w-4 h-4",
                      duplicateError || validationError ? "text-red-500" : ""
                    )}
                    onClick={handleAddItem}
                  />
                </div>
              </div>
              {(duplicateError || validationError) && (
                <p className="text-red-500 text-xs mt-1">
                  {duplicateError || validationError}
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
