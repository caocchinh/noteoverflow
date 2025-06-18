import React from "react";
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
}) => {
  return (
    <Select
      onValueChange={onValueChange}
      value={selectedValue}
      open={isOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue
          placeholder={isLoading ? loadingPlaceholder : placeholder}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{existingItemsLabel}</SelectLabel>
          {existingItems?.map((item) => (
            <SelectItem key={item} value={item}>
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

        <div className="flex items-center gap-2 p-2 mt-2">
          <Input
            placeholder={inputPlaceholder}
            value={newItemInputValue}
            onChange={(e) => onNewItemInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newItemInputValue !== "") {
                const allItems = [
                  ...newItems,
                  ...existingItems.map((item) => item),
                ];

                if (!allItems.includes(newItemInputValue)) {
                  onAddNewItem(newItemInputValue);
                }
              }
            }}
          />
          <div
            className="cursor-pointer"
            title={`Add new ${inputPlaceholder
              .toLowerCase()
              .replace("Enter new ", "")
              .replace(" name", "")}`}
          >
            <Plus
              className="w-4 h-4"
              onClick={() => {
                if (
                  newItemInputValue &&
                  !newItems.includes(newItemInputValue)
                ) {
                  onAddNewItem(newItemInputValue);
                }
              }}
            />
          </div>
        </div>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
