'use client';
import { X } from 'lucide-react';
import { Reorder } from 'motion/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-1 flex-col gap-3">
      <Reorder.Group
        axis="y"
        className="flex w-full flex-col gap-3"
        onReorder={onReorder}
        values={images}
      >
        {images.map((image, index) => (
          <Reorder.Item
            key={image.name + image.size + image.lastModified}
            onDragEnd={() => setIsDragging(false)}
            onDragStart={() => setIsDragging(true)}
            value={image}
          >
            <div className="flex w-full flex-row items-center justify-start gap-2">
              <p
                className="flex h-10 w-10 cursor-grab items-center justify-center rounded-md border border-foreground border-dashed bg-background"
                title="Change order"
              >
                {index + 1}.
              </p>
              <Button
                className=" wrap-anywhere h-max w-[200px] cursor-pointer whitespace-break-spaces text-sm sm:w-[300px] dark:bg-black dark:hover:bg-black"
                onClick={() => {
                  if (!isDragging) {
                    onViewImage(URL.createObjectURL(image));
                  }
                }}
                variant="outline"
              >
                {image.name}
              </Button>
              <div
                className="cursor-pointer hover:text-red-500"
                onClick={() => onRemoveImage(index)}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
};

export default ReorderableImageList;
