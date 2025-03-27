import { FileType } from "../types/artifacts";
import { BackIcon } from "../utils/icons";
import { useEffect, useState } from "react";

interface ArtifactMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  mediaGallery?: FileType[];
  pdfs?: FileType[];
  referenceLinks?: { title: string; url: string }[];
  audioGuide?: FileType;
}

export default function ArtifactMediaModal({
  isOpen,
  onClose,
  title,
  description,
  mediaGallery = [],
  pdfs = [],
  referenceLinks = [],
  audioGuide,
}: ArtifactMediaModalProps) {
  const [visible, setVisible] = useState(false);
  const [display, setDisplay] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setDisplay(true);
      setTimeout(() => setVisible(true), 10); // Delay to ensure transition
    } else {
      setVisible(false);
      const timer = setTimeout(
        () => setDisplay(false),
        300,
      );
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!display) return null;

  // Filter media by type
  const photos = mediaGallery.filter((item) =>
    item.mimeType.startsWith("image"),
  );
  const videos = mediaGallery.filter((item) =>
    item.mimeType.startsWith("video"),
  );

  return (
    <div
      className={`fixed inset-0 z-50 bg-white overflow-y-auto transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Header */}
      <div className="z-10 ">
        <div className="flex items-center justify-between p-4">
          <button
            className="border rounded-full w-20 py-auto flex justify-start items-center p-1"
            onClick={onClose}
          >
            <BackIcon className="w-6 h-6 flex justify-center items-center" />
            <p className="font-gilroy text-sm py-1">Back</p>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 ">
        {/* Title */}
        <h1 className="text-3xl font-semibold font-title">
          {title}
        </h1>
        {/* Description */}
        <div className="font-inter text-based font-light">
          {description}
        </div>

        {/* Photos Section */}
        {photos.length > 0 && (
          <section className="pb-4 pt-8 border-b border-gray-200">
            <h2 className="text-lg mb-4 font-gilroy">
              More Photos
            </h2>
            {/* Images in square format horizontally aligned */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="shrink-0 w-[240px] h-[240px] bg-black"
                >
                  <img
                    src={photo.fileURL}
                    alt={
                      photo.originalName ||
                      `Photo ${index + 1}`
                    }
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <section className="pb-4 pt-8 border-b border-gray-200">
            <h2 className="text-lg mb-4 font-gilroy">
              Video
            </h2>
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="aspect-video bg-black overflow-hidden"
                >
                  <video
                    src={video.fileURL}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video
                    tag.
                  </video>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audio Guide Section */}
        {audioGuide && (
          <section className="pb-4 pt-8 border-b border-gray-200">
            <h2 className="text-lg mb-4 font-gilroy">
              Audio Guide
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="font-medium text-gray-900">
                {audioGuide.originalName.split(".")[0] ||
                  "Audio Guide"}
              </div>
              <audio controls>
                <source
                  src={audioGuide.fileURL}
                  type="audio/mpeg"
                />
                Your browser does not support the audio
                element.
              </audio>
            </div>
          </section>
        )}

        {/* Study Materials Section */}
        {referenceLinks.length > 0 && (
          <section className="pb-4 pt-8 border-b border-gray-200">
            <h2 className="text-lg mb-4 font-gilroy">
              Study Material and Downloads
            </h2>
            <div className="space-y-3">
              {referenceLinks.map((material, index) => (
                <a
                  key={index}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {material.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {material.url.split("/").slice(-1)[0]}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* PDF Downloads Section */}
        {pdfs.length > 0 && (
          <section className="pb-4 pt-8 border-b border-gray-200">
            <h2 className="text-lg mb-4 font-gilroy">
              PDF Downloads
            </h2>
            <div className="space-y-3">
              {pdfs.map((pdf, index) => (
                <a
                  key={index}
                  href={pdf.fileURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={pdf.originalName}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-gray-200 rounded-md p-2 mr-3">
                    <svg
                      className="w-6 h-6 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {pdf.originalName ||
                        `File ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {pdf.fileSize
                        ? `${Math.round(
                            pdf.fileSize / 1024,
                          )} KB - `
                        : ""}
                      {pdf.fileURL.split("/").slice(-1)[0]}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
