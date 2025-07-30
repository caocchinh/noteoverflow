import { Button } from "@/components/ui/button";
import { useState } from "react";
import { QR } from "./QR";

export const ShareFilterButton = ({
  isQuestionViewDisabled,
  url,
}: {
  isQuestionViewDisabled: boolean;
  url: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Button
      className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
      disabled={isQuestionViewDisabled}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      Share filter
      <QR url={url} isOpen={isOpen} setIsOpen={setIsOpen} />
    </Button>
  );
};
