import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Blocks } from "lucide-react";
import { PopoverContent } from "@/components/ui/popover";
import ElasticSlider from "./ElasticSlider";

export default function LayoutSetting({
  setNumberOfColumns,
}: {
  setNumberOfColumns: (numberOfColumns: number) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <Blocks />
          Layout settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100006] h-[190px] flex flex-col items-center justify-center gap-3">
        <h4 className="text-sm font-medium text-center mb-2">
          Number of maximum displayed columns
        </h4>
        <ElasticSlider
          startingValue={1}
          maxValue={5}
          isStepped
          stepSize={1}
          setColumnsProp={setNumberOfColumns}
        />
      </PopoverContent>
    </Popover>
  );
}
