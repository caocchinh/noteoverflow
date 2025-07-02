import { Check, Plus, Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { EnhancedSelectProps } from '../constants/types';

const EnhancedSelect = ({
  selectedValue,
  onValueChange,
  existingItems,
  placeholders,
  labels,
  isLoading,
  className = 'w-full',
  disabled = false,
  validator,
  inputType = 'text',
}: EnhancedSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newItemInputValue, setNewItemInputValue] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [newItems, setNewItems] = useState<string[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleAddNewItem = (item: string) => {
    setNewItems([...newItems, item]);
    setNewItemInputValue('');
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
    if (selectedValue === newItems[index]) {
      onValueChange('');
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

    if (e.key === 'Enter' && newItemInputValue) {
      const validationResult = validateInput(newItemInputValue);

      if (validationResult) {
        if (isItemDuplicate(newItemInputValue)) {
          setDuplicateError(validationResult);
          setValidationError(null);
        } else {
          setDuplicateError(null);
          setValidationError(validationResult);
        }
      } else {
        handleAddNewItem(newItemInputValue);
        setDuplicateError(null);
        setValidationError(null);
      }
    }
  };

  const handleAddItem = () => {
    if (newItemInputValue) {
      const validationResult = validateInput(newItemInputValue);

      if (validationResult) {
        if (isItemDuplicate(newItemInputValue)) {
          setDuplicateError(validationResult);
          setValidationError(null);
        } else {
          setDuplicateError(null);
          setValidationError(validationResult);
        }
      } else {
        handleAddNewItem(newItemInputValue);
        setDuplicateError(null);
        setValidationError(null);
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
    if (isOpen || disabled || isLoading) {
      return;
    }

    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && isInputFocused) {
      return;
    }
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

  const noneDuplicateItems = useMemo(() => {
    return [...new Set([...existingItems, ...newItems])];
  }, [existingItems, newItems]);

  const getPlaceholder = () => {
    if (isLoading) {
      return placeholders.loading;
    }
    if (disabled) {
      return placeholders.first;
    }
    return placeholders.input;
  };

  return (
    <div className="w-full" onClick={handleWrapperClick} ref={wrapperRef}>
      <h5 className="mb-1 block font-medium text-sm">{labels.label}</h5>
      <div className="relative">
        <Select
          disabled={disabled || isLoading}
          onOpenChange={handleOpenChange}
          onValueChange={onValueChange}
          open={isOpen}
          value={selectedValue}
        >
          <SelectTrigger className={cn(className, 'cursor-pointer')}>
            <SelectValue placeholder={getPlaceholder()} />
          </SelectTrigger>
          <SelectContent className="!z-[99999999999999999] max-w-[320px] sm:max-w-[620px]">
            <div className="flex w-full items-center border-b p-2">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-8 flex-grow border-0 px-3 outline-none"
                onBlur={(e) => {
                  e.stopPropagation();
                  setIsInputFocused(false);
                }}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onFocus={(e) => {
                  e.stopPropagation();
                  setIsInputFocused(true);
                }}
                placeholder="Search"
                value={searchQuery}
              />
              {searchQuery && (
                <div
                  className="cursor-pointer "
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X className="ml-2 h-4 w-4 cursor-pointer text-muted-foreground hover:text-red-500" />
                </div>
              )}
            </div>

            <SelectGroup>
              <SelectLabel>{labels.existingItems}</SelectLabel>
              {noneDuplicateItems
                .filter((item) => existingItems.includes(item))
                .map((item) => (
                  <SelectItem
                    className={cn(
                      'hidden ',
                      filteredExistingItems.includes(item) && 'block'
                    )}
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>{labels.newItems}</SelectLabel>
              {noneDuplicateItems
                .filter((item) => !existingItems.includes(item))
                .map((item, index) => (
                  <div
                    className={cn(
                      'group wrap-anywhere w-full cursor-pointer items-center justify-between rounded-md p-2 text-sm hover:bg-muted',
                      filteredNewItems.includes(item) ? 'flex' : 'hidden'
                    )}
                    key={item}
                    onClick={() => {
                      onValueChange(item);
                      setIsOpen(false);
                    }}
                  >
                    {item}
                    <div className="flex items-center gap-2">
                      <X
                        className="hidden h-4 w-4 group-hover:block"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNewItem(index);
                        }}
                      />
                      <Check
                        className={cn(
                          'h-4 w-4 group-hover:hidden',
                          selectedValue === item ? 'block' : 'hidden'
                        )}
                        onClick={() => {
                          onValueChange(item);
                        }}
                      />
                    </div>
                  </div>
                ))}
            </SelectGroup>

            {noneDuplicateItems
              .filter(
                (item) =>
                  newItems.includes(item) && !existingItems.includes(item)
              )
              .map((item) => (
                <SelectItem className="hidden" key={item} value={item}>
                  {item}
                </SelectItem>
              ))}

            <div className="mt-2 flex flex-col items-start gap-2 p-2">
              <div className="flex w-full items-center gap-2">
                <Input
                  className={cn(
                    'flex-grow rounded-md border px-3 py-2 focus:outline-none',
                    duplicateError || validationError
                      ? 'border-red-500'
                      : 'border-input'
                  )}
                  onBlur={(e) => {
                    e.stopPropagation();
                    setIsInputFocused(false);
                  }}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={(e) => {
                    e.stopPropagation();
                    setIsInputFocused(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders.input}
                  type={inputType}
                  value={newItemInputValue}
                />
                <div
                  className="cursor-pointer"
                  title={`Add new ${placeholders.input
                    .toLowerCase()
                    .replace('Enter new ', '')
                    .replace(' name', '')}`}
                >
                  <Plus
                    className={cn(
                      'h-4 w-4',
                      duplicateError || validationError ? 'text-red-500' : ''
                    )}
                    onClick={handleAddItem}
                  />
                </div>
              </div>
              {(duplicateError || validationError) && (
                <p className="mt-1 text-red-500 text-xs">
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
