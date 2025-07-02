import { FolderUp, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FileDrop = ({
  handleDrop,
  handleInputChange,
}: {
  handleDrop: (e: React.DragEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className="flex w-[90%] flex-col items-center justify-center rounded-xl border-2 border-primary border-dashed bg-card p-8 transition-all sm:w-max"
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center text-center">
        <FolderUp className="mb-4 h-16 w-16 text-primary" />
        <p className="mb-2 font-medium text-foreground text-lg">
          Drag & drop your image here
        </p>
        <p className="mb-4 text-muted-foreground text-sm">
          Or select using the button below
        </p>

        <label className="relative cursor-pointer">
          <Button>
            <Upload className="mr-2" size={18} />
            Select Image (must be .webp)
          </Button>
          <input
            accept="image/webp"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={handleInputChange}
            type="file"
          />
        </label>
      </div>
    </div>
  );
};

export default FileDrop;
