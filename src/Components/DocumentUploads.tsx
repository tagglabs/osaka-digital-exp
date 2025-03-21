import React from "react";
import { Dropzone } from "../Components/Dropzone";
import { UploadPreview } from "../Components/UploadPreview";
import { FileType } from "../types/artifacts";

interface FileWithPreview extends FileType {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface DocumentUploadsProps {
  pdfs: FileWithPreview[];
  onFileUpload: (files: File[]) => void;
  onDelete: (index: number) => void;
  error?: string;
}

const DocumentUploads: React.FC<DocumentUploadsProps> = ({
  pdfs,
  onFileUpload,
  onDelete,
  error,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="uppercase text-left pb-5">
        PDF Documents
      </h3>

      {/* PDF Files List */}
      <div className="flex flex-col gap-1">
        {pdfs.map((pdf, index) => (
          <div key={index} className="relative">
            <UploadPreview
              fileURL={pdf.preview}
              fileName={pdf.originalName}
              onDelete={() => onDelete(index)}
            />
            {/* Progress bar */}
            {pdf.progress > 0 && pdf.progress < 100 && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded h-1">
                  <div
                    className="bg-blue-600 h-1 rounded"
                    style={{ width: `${pdf.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  Uploading... {Math.round(pdf.progress)}%
                </p>
              </div>
            )}
            {/* Error message */}
            {pdf.error && (
              <p className="text-sm text-red-500 mt-1">
                {pdf.error}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div className="mt-4">
        <Dropzone
          id="pdfs"
          onDrop={onFileUpload}
          accept=".pdf,application/pdf"
          multiple={true}
          error={error}
        />
        <p className="text-xs text-gray-500 mt-2">
          Only PDF files are accepted
        </p>
      </div>
    </div>
  );
};

export default DocumentUploads;
