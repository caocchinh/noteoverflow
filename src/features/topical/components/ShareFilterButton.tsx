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
      className="bg-logo-main hover:bg-logo-main/90 w-full cursor-pointer text-white"
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
