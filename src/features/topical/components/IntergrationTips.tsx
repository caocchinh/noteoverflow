import React, { useRef, useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTopicalApp } from "../context/TopicalLayoutProvider";

const IntergrationTips = () => {
  const [isOpen, setIsOpen] = useState(true);
  const isMounted = useRef(false);
  const { setIsCalculatorOpen } = useTopicalApp();

  useEffect(() => {
    if (isMounted.current) {
      return;
    }
    const saved = localStorage.getItem("integrationTipsOpen");
    if (saved !== null) {
      try {
        setIsOpen(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
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
        <Button
          className="text-center cursor-pointer mb-2 text-sm h-[30px]"
          variant="outline"
        >
          {isOpen ? "Hide" : "Show"} Tips
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex items-center justify-center w-full flex-col mb-4">
        <p className="text-md text-center mb-2 text-green-600 ">
          Watch this video to learn how to utilize Desmos to enhance your
          studies in integration. You can use the embedded Desmos calculator in
          inspect mode. Click buttons below to try out!
        </p>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Button
              onClick={copyToDesmos}
              size="sm"
              variant="outline"
              className="text-xs cursor-pointer uppercase flex-1"
            >
              Click to copy the Desmos command template
            </Button>
            <Button
              onClick={() => setIsCalculatorOpen(true)}
              size="sm"
              className="text-xs cursor-pointer uppercase flex-1"
            >
              Click to try the embedded calculator
            </Button>
          </div>
        </div>
        <div className="relative w-full max-w-3xl aspect-video rounded-xl overflow-hidden shadow-md border border-border">
          <iframe
            title="Integration topic walkthrough"
            src="https://www.youtube.com/embed/otA0aCjlou0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default IntergrationTips;
