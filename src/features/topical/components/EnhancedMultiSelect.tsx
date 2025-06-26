import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/features/topical/components/multi-select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useState } from "react";

const EnhancedMultiSelect = ({
  label,
  dropDownHeight,
  values,
  prerequisite,
  onValuesChange,
  loop,
  data,
}: {
  label: string;
  dropDownHeight?: string;
  values: string[] | number[];
  prerequisite: string;
  onValuesChange: (values: string[] | number[]) => void;
  loop: boolean;
  data?: string[] | number[];
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-1">
      <Label
        onClick={() => {
          setOpen(!open);
        }}
        className="w-max"
      >
        {label}
      </Label>
      <MultiSelector
        values={values.map((item) => item.toString())}
        allAvailableOptions={data?.map((item) => item.toString()) ?? []}
        onValuesChange={onValuesChange}
        loop={loop}
        className="w-[300px]"
      >
        <MultiSelectorTrigger>
          <div className="basis-[90%] flex items-center gap-2 px-4">
            <Search className="h-4 w-4" />
            <MultiSelectorInput
              disabled={!data}
              placeholder={
                data
                  ? `Search ${label.toLowerCase()}`
                  : `Select ${prerequisite.toLowerCase()} first`
              }
            />
          </div>
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <MultiSelectorList className={dropDownHeight}>
            {data?.map((item, i) => (
              <MultiSelectorItem key={i} value={item.toString()}>
                {item}
              </MultiSelectorItem>
            ))}
          </MultiSelectorList>
        </MultiSelectorContent>
      </MultiSelector>
    </div>
  );
};

export default EnhancedMultiSelect;
