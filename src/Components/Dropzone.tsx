import dropzone from "../assets/dropzone.png";
import { useCallback, useEffect, useRef } from "react";

interface DropzoneProps {
  onDrop?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  id: string; // Unique identifier for each dropzone
  error: string | false;
}

export const Dropzone = ({
  onDrop,
  accept,
  multiple = false,
  id,
  error,
}: DropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (multiple) {
        onDrop?.(files);
      } else {
        onDrop?.(files.slice(0, 1));
      }
    },
    [onDrop, multiple],
  );

  const handleDragOver = (
    e: React.DragEvent<HTMLLabelElement>,
  ) => {
    e.preventDefault();
  };

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (multiple) {
        onDrop?.(files);
      } else {
        onDrop?.(files.slice(0, 1));
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor={`dropzone-${id}`}
        className={`flex flex-col items-center justify-center w-full pt-2 border-2 border-dashed rounded-lg cursor-pointer
          ${error ? "border-red-500" : "border-gray-300"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center justify-center">
          <img
            src={dropzone}
            alt="dropzone"
            className="object-contain size-[40px]"
          />
          <p className="mb-1">
            Drag & Drop to upload media
          </p>
          <p className="text-[8px] text-gray-primary uppercase">
            or
          </p>
          <button
            type="button"
            className="px-4 py-2 my-1 bg-gray-300 rounded-l-full rounded-r-full text-[10px]"
            onClick={() => inputRef.current?.click()}
          >
            Upload files
          </button>
          <p className="mb-2 text-[10px] uppercase text-red-500">
            MAXIMUM FILE SIZE: 100MB
          </p>
        </div>
        <input
          ref={inputRef}
          id={`dropzone-${id}`}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />
      </label>
      {error && (
        <p className="mt-1 text-sm text-red-500 self-center">
          {error}
        </p>
      )}
    </div>
  );
};
