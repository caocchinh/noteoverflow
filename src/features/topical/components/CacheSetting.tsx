import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function CacheAccordion({
  isSessionCacheEnabled,
  setIsSessionCacheEnabled,
  isPersistantCacheEnabled,
  setIsPersistantCacheEnabled,
}: {
  isSessionCacheEnabled: boolean;
  setIsSessionCacheEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  isPersistantCacheEnabled: boolean;
  setIsPersistantCacheEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="flex w-full cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <Settings />
          Cache settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100006]">
        <Accordion
          className="w-full"
          collapsible
          defaultValue="session-cache"
          type="single"
        >
          <AccordionItem value="session-cache">
            <AccordionTrigger>Session cache</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Automatically restores your filters from the last session on
                page refresh. Not synced across devices. Is enabled by default.
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="session-cache">Enable session cache</Label>
                <Switch
                  checked={isSessionCacheEnabled}
                  id="session-cache"
                  onCheckedChange={setIsSessionCacheEnabled}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="persistant-cache">
            <AccordionTrigger>Persistant cache</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Permanently saves your filter preferences for each subject. When
                you re-select a subject, previously used filters are
                automatically applied. Not synced across devices. Is enabled by
                default.
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="persistant-cache">
                  Enable persistant cache
                </Label>
                <Switch
                  checked={isPersistantCacheEnabled}
                  id="persistant-cache"
                  onCheckedChange={setIsPersistantCacheEnabled}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </PopoverContent>
    </Popover>
  );
}
