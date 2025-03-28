import Trash from "../assets/trash.png";

interface UploadPreviewProps {
  fileName?: string;
  fileSize?: number;
  fileURL?: string;
  onDelete?: () => void;
}

export const UploadPreview = ({ fileName, fileSize, fileURL, onDelete }: UploadPreviewProps) => {
  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="w-full border-2 border-gray-secondary rounded-md flex justify-between items-center pl-1 pr-4">
      <div className="flex items-center justify-between gap-2">
        <div className="size-[30px] rounded-sm bg-gray-300"></div>
        <div className="flex flex-col">
          <p>{fileName || fileURL || "Unnamed File"}</p>
          {fileSize && (
            <p className="text-gray-primary text-[10px] uppercase">
              {formatFileSize(fileSize)}
            </p>
          )}
        </div>
      </div>
      <img 
        src={Trash} 
        alt="delete" 
        className="cursor-pointer"
        onClick={onDelete}
      />
    </div>
  );
};
