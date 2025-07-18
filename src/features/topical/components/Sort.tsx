import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilterData } from "../constants/types";
import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Sort = ({
  sortParameters,
  setSortParameters,
  currentQuery,
}: {
  sortParameters: {
    topic: Record<string, number>;
    paperType: Record<string, number>;
    year: Record<string, number>;
    season: Record<string, number>;
  } | null;
  setSortParameters: (
    value: {
      topic: Record<string, number>;
      paperType: Record<string, number>;
      year: Record<string, number>;
      season: Record<string, number>;
    } | null
  ) => void;
  currentQuery: {
    curriculumId: string;
    subjectId: string;
  } & FilterData;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer rounded-[2px]"
          title="Sort questions"
        >
          Sort
          <ArrowDownWideNarrow />
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogDescription>Sort questions</DialogDescription>
          <Accordion type="single" collapsible>
            <AccordionItem value="how-does-this-work">
              <AccordionTrigger>How does this work?</AccordionTrigger>
              <AccordionContent>
                Questions are sorted by: Position × Weight = Priority Score.
                Drag items to change position (higher = more important). Adjust
                weights for greater influence. Default: Years (3×) newest-first,
                all others (1×). Your settings determine the final question
                order.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default Sort;
