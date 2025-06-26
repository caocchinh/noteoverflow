import {
  MultiSelector,
  MultiSelectorTrigger,
  MultiSelectorInput,
  MultiSelectorContent,
  MultiSelectorList,
  MultiSelectorItem,
} from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

const EnhancedMultiSelect = ({
  label,
  values,
  onValuesChange,
  loop,
  data,
}: {
  label: string;
  values: string[] | number[];
  onValuesChange: (values: string[] | number[]) => void;
  loop: boolean;
  data?: string[] | number[];
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <MultiSelector
        values={values.map((item) => item.toString())}
        allAvailableOptions={data?.map((item) => item.toString()) ?? []}
        onValuesChange={onValuesChange}
        loop={loop}
        className="w-[300px]"
      >
        <MultiSelectorTrigger>
          <div className="basis-full flex items-center gap-2 px-4">
            <Search className="h-4 w-4" />
            <MultiSelectorInput
              disabled={!data}
              placeholder={`Search ${label.toLowerCase()}`}
            />
          </div>
        </MultiSelectorTrigger>
        <MultiSelectorContent>
          <MultiSelectorList>
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
