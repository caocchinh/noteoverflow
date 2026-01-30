import { memo, useState } from "react";
import { QR } from "../QR";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const ShareFilterButton = memo(
  ({ isDisabled, filterUrl }: { isDisabled: boolean; filterUrl: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button
          className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
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
