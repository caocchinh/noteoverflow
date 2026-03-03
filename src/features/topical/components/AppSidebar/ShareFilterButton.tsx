import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { memo, useState } from "react";
import { QR } from "../QR";

const ShareFilterButton = memo(
  ({ isDisabled, filterUrl }: { isDisabled: boolean; filterUrl: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button
          className="bg-logo-main hover:bg-logo-main/90 w-full cursor-pointer text-white"
          disabled={isDisabled}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Share filter
          <Send />
        </Button>
        <QR url={filterUrl} isOpen={isOpen} setIsOpen={setIsOpen} />
      </>
    );
  },
);
ShareFilterButton.displayName = "ShareFilterButton";

export default ShareFilterButton;
