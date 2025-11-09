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
import { Settings, X } from "lucide-react";
import { useState } from "react";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

export default function CacheAccordion() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { uiPreferences, setUiPreference } = useTopicalApp();
  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex w-full cursor-pointer items-center justify-start gap-2"
          variant="secondary"
        >
          <Settings />
          Cache settings
        </Button>
      </PopoverTrigger>
      <PopoverContent className="z-[100006] flex flex-col items-center justify-center gap-3">
        <X
          className="w-4 h-4 absolute top-2 right-2 cursor-pointer"
          onClick={() => setIsPopoverOpen(false)}
        />
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
                  checked={uiPreferences.isSessionCacheEnabled}
                  id="session-cache"
                  onCheckedChange={() => {
                    setUiPreference("isSessionCacheEnabled", (prev) => !prev);
                  }}
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
                  checked={uiPreferences.isPersistantCacheEnabled}
                  id="persistant-cache"
                  onCheckedChange={() => {
                    setUiPreference(
                      "isPersistantCacheEnabled",
                      (prev) => !prev
                    );
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="question-cache">
            <AccordionTrigger>Question cache</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Caches opened questions during inspection. On refresh, cached
                questions will automatically reopen in inspect mode if it was
                previously active. Is enabled by default.
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="question-cache">Enable question cache</Label>
                <Switch
                  checked={uiPreferences.isQuestionCacheEnabled}
                  id="question-cache"
                  onCheckedChange={() => {
                    setUiPreference("isQuestionCacheEnabled", (prev) => !prev);
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </PopoverContent>
    </Popover>
  );
}
