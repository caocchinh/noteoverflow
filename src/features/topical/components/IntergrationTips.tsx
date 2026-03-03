import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

const IntergrationTips = () => {
  const [isOpen, setIsOpen] = useState(true);
  const isMounted = useRef(false);
  const { setIsCalculatorOpen } = useTopicalApp();
  const onMount = useEffectEvent(() => {
    const saved = localStorage.getItem("integrationTipsOpen");
    if (saved !== null) {
      try {
        setIsOpen(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  });

  useEffect(() => {
    if (isMounted.current) {
      return;
    }
    onMount();
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      return;
    }
    try {
      localStorage.setItem("integrationTipsOpen", JSON.stringify(isOpen));
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  const copyToDesmos = async () => {
    const desmosCode = `f\\left(x\\right)=\\frac{1}{10}x^{3}+1
\\int_{a}^{b}f\\left(x\\right)dx
b=\\pi
a=-\\pi
0\\le y\\le f\\left(x\\right)\\left\\{a<x<b\\right\\}
0\\ge y\\ge f\\left(x\\right)\\left\\{a<x<b\\right\\}`;
    try {
      await navigator.clipboard.writeText(desmosCode);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button className="mb-2 h-[30px] cursor-pointer text-center text-sm" variant="outline">
          {isOpen ? "Hide" : "Show"} Tips
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mb-4 flex w-full flex-col items-center justify-center">
        <p className="text-md mb-2 text-center text-green-600">
          Watch this video to learn how to utilize Desmos to enhance your studies in integration.
          You can use the embedded Desmos calculator in inspect mode. Click buttons below to try
          out!
        </p>
        <div className="flex flex-col">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Button
              onClick={copyToDesmos}
              size="sm"
              variant="outline"
              className="flex-1 cursor-pointer text-xs uppercase"
            >
              Click to copy the Desmos command template
            </Button>
            <Button
              onClick={() => setIsCalculatorOpen(true)}
              size="sm"
              className="flex-1 cursor-pointer text-xs uppercase"
            >
              Click to try the embedded calculator
            </Button>
          </div>
        </div>
        <div className="border-border relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl border shadow-md">
          <iframe
            title="Integration topic walkthrough"
            src="https://www.youtube.com/embed/otA0aCjlou0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default IntergrationTips;
