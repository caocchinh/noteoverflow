import { memo } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInputWithControlsProps } from "./types";

const NumberInputWithControls = memo(
  ({
    value,
    onChange,
    min,
    max,
    placeholder,
    label,
    error,
  }: NumberInputWithControlsProps) => {
    const handleDecrease = () => {
      const current = parseInt(value) || min;
      onChange((current > min ? current - 1 : max).toString());
    };

    const handleIncrease = () => {
      const current = parseInt(value) || min;
      onChange((current < max ? current + 1 : min).toString());
    };

    return (
      <div>
        {label && (
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        )}
        <div className="flex items-center gap-2">
          <Button
            className="w-8 h-8 rounded-lg cursor-pointer"
            variant="outline"
            size="sm"
            title="Decrease"
            onClick={handleDecrease}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <Input
            placeholder={placeholder}
            max={max}
            min={min}
            value={value}
            type="number"
            className="text-center font-mono font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
            onChange={(e) => onChange(e.target.value)}
          />
          <Button
            className="w-8 h-8 rounded-lg cursor-pointer"
            variant="outline"
            size="sm"
            title="Increase"
            onClick={handleIncrease}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        {error && (
          <div className="flex items-center mt-2 gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-md">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">
              {error}
            </p>
          </div>
        )}
      </div>
    );
  }
);

NumberInputWithControls.displayName = "NumberInputWithControls";

export default NumberInputWithControls;
