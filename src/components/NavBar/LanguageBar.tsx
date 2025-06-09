"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { LANGUAGE_LIST } from "@/constants/constants";

const LanguageBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentLanguage = pathname.split("/")[1];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-max justify-between cursor-pointer gap-1 !px-2"
        >
          <Image
            src={
              LANGUAGE_LIST.find(
                (_language) => _language.value === currentLanguage
              )?.image_src || ""
            }
            alt="language"
            width={15}
            height={11.25}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[140px] p-0 relative z-[9999999999]">
        {LANGUAGE_LIST.map((_language) => (
          <div
            key={_language.value}
            className="cursor-pointer rounded-md flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
            onClick={() => {
              console.log(_language.value);
              setIsOpen(false);
              window.location.href = `/${_language.value}/${
                pathname.split("/")[2] || ""
              }`;
            }}
          >
            {_language.label}
            <Image
              src={_language.image_src}
              alt="language"
              width={20}
              height={15}
            />
            <Check
              size={16}
              className={cn(
                "ml-auto",
                currentLanguage === _language.value
                  ? "opacity-100"
                  : "opacity-0"
              )}
            />
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default LanguageBar;
