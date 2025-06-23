"use client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Reorder } from "motion/react";
import { useState } from "react";

interface ReorderableImageListProps {
  images: File[];
  onReorder: (newOrder: File[]) => void;
  onRemoveImage: (index: number) => void;
  onViewImage: (imageUrl: string) => void;
}

const ReorderableImageList = ({
  images,
  onReorder,
  onRemoveImage,
  onViewImage,
}: ReorderableImageListProps) => {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div className="flex flex-col flex-1 gap-3">
      <Reorder.Group
        axis="y"
        className="flex flex-col w-full gap-3"
        values={images}
        onReorder={onReorder}
      >
        {images.map((image, index) => (
          <Reorder.Item
            key={image.name + image.size + image.lastModified}
            value={image}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <div className="flex flex-row w-full items-center justify-start gap-2">
              <p
                className="border-dashed rounded-md border bg-background border-foreground w-10 h-10 flex items-center justify-center cursor-grab"
                title="Change order"
              >
                {index + 1}.
              </p>
              <Button
                variant="outline"
                className=" w-[200px] sm:w-[300px] text-sm wrap-anywhere whitespace-break-spaces h-max cursor-pointer dark:hover:bg-black dark:bg-black"
                onClick={() => {
                  if (!isDragging) {
                    onViewImage(URL.createObjectURL(image));
                  }
                }}
              >
                {image.name}
              </Button>
              <div
                onClick={() => onRemoveImage(index)}
                className="cursor-pointer hover:text-red-500"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default ReorderableImageList;
