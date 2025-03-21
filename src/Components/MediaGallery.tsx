import React, { useState } from "react";
import { SelectFileType } from "../Components/SelectFileType";
import { Dropzone } from "../Components/Dropzone";
import { UploadPreview } from "../Components/UploadPreview";
import { FileType } from "../types/artifacts";

interface FileWithPreview extends FileType {
  file: File;
  preview: string;
  progress: number;
  error?: string;
}

interface MediaState {
  images: FileWithPreview[];
  videos: FileWithPreview[];
}

interface MediaGalleryProps {
  mediaFiles: MediaState;
  onImageUpload: (files: File[]) => void;
  onVideoUpload: (files: File[]) => void;
  onDelete: (
    index: number,
    type: "image" | "video",
  ) => void;
  error?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  mediaFiles,
  onImageUpload,
  onVideoUpload,
  onDelete,
  error,
}) => {
  const [activeMediaType, setActiveMediaType] = useState<
    "image" | "video"
  >("image");

  const currentMedia =
    activeMediaType === "image"
      ? mediaFiles.images
      : mediaFiles.videos;
  const handleUpload =
    activeMediaType === "image"
      ? onImageUpload
      : onVideoUpload;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="uppercase text-left pb-5">
        Media Gallery
      </h3>

      {/* Media Type Selector */}
      <div className="flex w-full gap-6">
        <SelectFileType
          placeholder="Image"
          extension="PNG, JPEG, JPG"
          selected={activeMediaType === "image"}
          onClick={() => setActiveMediaType("image")}
        />
        <SelectFileType
          placeholder="Video"
          extension="MP4, WEBM"
          selected={activeMediaType === "video"}
          onClick={() => setActiveMediaType("video")}
        />
      </div>

      {/* Upload Area */}
      <Dropzone
        id="media"
        onDrop={handleUpload}
        accept={
          activeMediaType === "image"
            ? "image/*"
            : "video/mp4,video/webm"
        }
        multiple={true}
        error={error}
      />

      {/* Uploads List */}
      <p className="text-[12px] text-gray-primary uppercase mt-4">
        Uploads
      </p>
      <div className="flex flex-col gap-4">
        {currentMedia.map((file, index) => (
          <div key={index} className="relative">
            <div className="flex gap-4">
              {/* Preview */}
              <div className="w-20 h-20 rounded overflow-hidden">
                {activeMediaType === "image" ? (
                  <img
                    src={file.preview}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={file.preview}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>

              {/* File Info and Progress */}
              <div className="flex-1">
                <UploadPreview
                  fileName={file.originalName}
                  fileSize={file.fileSize}
                  onDelete={() =>
                    onDelete(index, activeMediaType)
                  }
                />

                {/* Progress bar */}
                {file.progress > 0 &&
                  file.progress < 100 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded h-1">
                        <div
                          className="bg-blue-600 h-1 rounded"
                          style={{
                            width: `${file.progress}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        Uploading...{" "}
                        {Math.round(file.progress)}%
                      </p>
                    </div>
                  )}

                {/* Error message */}
                {file.error && (
                  <p className="text-sm text-red-500 mt-1">
                    {file.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;
