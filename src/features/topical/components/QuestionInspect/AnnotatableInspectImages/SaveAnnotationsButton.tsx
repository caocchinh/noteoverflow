import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2, Save } from "lucide-react";
import { memo } from "react";

const SaveAnnotationsButton = memo(
  ({
    onSave,
    isSaving,
    hasUnsavedChanges,
    isDisabled,
    isUserNotAuthenticated,
  }: {
    onSave: () => void;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    isDisabled: boolean;
    isUserNotAuthenticated: boolean;
  }) => {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="cursor-pointer h-[26px]"
              variant={hasUnsavedChanges ? "default" : "outline"}
              onClick={onSave}
              disabled={
                (isDisabled || isSaving || !hasUnsavedChanges) &&
                !isUserNotAuthenticated
              }
              title={
                hasUnsavedChanges ? "Save annotations" : "No unsaved changes"
              }
            >
              {isSaving ? (
                <>
                  <span className="hidden sm:block">Saving</span>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  <span className="hidden sm:block">Save</span>
                  <Save className="h-4 w-4" />
                </>
              )}
            </Button>
          </TooltipTrigger>
          {isUserNotAuthenticated && (
            <TooltipContent className="z-999998" side="bottom">
              <p>Login to save annotation</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }
);

SaveAnnotationsButton.displayName = "SaveAnnotationsButton";

export default SaveAnnotationsButton;
