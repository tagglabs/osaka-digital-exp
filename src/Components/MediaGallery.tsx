import React, { useState } from "react";
import { SelectFileType } from "../Components/SelectFileType";
import { Dropzone } from "../Components/Dropzone";
import { UploadPreview } from "../Components/UploadPreview";
interface MediaState {
  images: File[];
  videos: File[];
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
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1">
                <UploadPreview
                  fileName={file.name}
                  fileSize={file.size}
                  onDelete={() =>
                    onDelete(index, activeMediaType)
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;
