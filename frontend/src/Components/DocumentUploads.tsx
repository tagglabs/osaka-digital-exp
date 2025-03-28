import React from "react";
import { Dropzone } from "./Dropzone";
import { UploadPreview } from "./UploadPreview";
interface DocumentUploadsProps {
  pdfs: File[];
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
              fileURL={URL.createObjectURL(pdf)}
              fileName={pdf.name}
              onDelete={() => onDelete(index)}
            />
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
