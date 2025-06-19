import { Button } from "@/components/ui/button";
import { FolderUp, Upload } from "lucide-react";

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
      className="w-[90%] sm:w-max p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center border-primary bg-card transition-all"
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      <div className="flex flex-col items-center text-center">
        <FolderUp className="w-16 h-16 mb-4 text-primary" />
        <p className="text-lg mb-2 font-medium text-foreground">
          Drag & drop your image here
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Or select using the button below
        </p>

        <label className="relative cursor-pointer">
          <Button>
            <Upload className="mr-2" size={18} />
            Select Image (must be .webp)
          </Button>
          <input
            type="file"
            accept="image/webp"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

export default FileDrop;
