import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { memo, useCallback } from "react";
import { NumberInputWithControlsProps } from "./types";

const NumberInputWithControls = memo(
  ({ value, onChange, min, max, placeholder, label, error }: NumberInputWithControlsProps) => {
    const handleDecrease = useCallback(() => {
      const current = parseInt(value) || min;
      onChange((current > min ? current - 1 : max).toString());
    }, [value, min, max, onChange]);

    const handleIncrease = useCallback(() => {
      const current = parseInt(value) || min;
      onChange((current < max ? current + 1 : min).toString());
    }, [value, min, max, onChange]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
      },
      [onChange],
    );

    return (
      <div>
        {label && <span className="text-muted-foreground text-xs font-medium">{label}</span>}
        <div className="flex items-center gap-2">
          <Button
            className="h-8 w-8 cursor-pointer rounded-lg"
            variant="outline"
            size="sm"
            title="Decrease"
            onClick={handleDecrease}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            placeholder={placeholder}
            max={max}
            min={min}
            value={value}
            type="number"
            className="flex-1 [appearance:textfield] text-center font-mono font-semibold [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            onChange={handleInputChange}
          />
          <Button
            className="h-8 w-8 cursor-pointer rounded-lg"
            variant="outline"
            size="sm"
            title="Increase"
            onClick={handleIncrease}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-2 dark:border-red-800/30 dark:bg-red-950/20">
            <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    );
  },
);

NumberInputWithControls.displayName = "NumberInputWithControls";

export default NumberInputWithControls;
