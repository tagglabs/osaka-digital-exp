import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Artifact, APIResponse } from "../types/artifacts";
import {
  BookmarkIcon,
  DownloadsIcon,
} from "../utils/icons";
import Modal from "../Components/Modal";

function ArtifactDetails() {
  const { id } = useParams<{ id: string }>();
  const [artifact, setArtifact] = useState<Artifact | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showDownloadModal, setShowDownloadModal] =
    useState(false);

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await fetch(
          `/api/artifacts/${id}`,
        );
        const data: APIResponse<Artifact> =
          await response.json();

        if (!data.success || !data.data) {
          throw new Error(
            data.error || "Failed to fetch artifact",
          );
        }

        setArtifact(data.data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtifact();
  }, [id]);

  const handleBookmark = () => {
    console.log("Bookmark clicked");
  };

  const handledDownloads = () => {
    setShowDownloadModal(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!artifact) {
    return <div>Artifact not found</div>;
  }

  return (
    <div className="w-screen h-screen mx-auto relative">
      {/* Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Available Downloads"
      >
        {artifact.uploads.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              The following files are available for
              download:
            </p>
            {artifact.uploads.map((upload, index) => (
              <a
                key={index}
                href={upload.fileURL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
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
                  <p className="font-medium text-gray-800">
                    {upload.fileURL || `File ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Click to download
                  </p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600">
              No files are available for download.
            </p>
          </div>
        )}
      </Modal>

      {/* Image Content */}
      <div className="flex h-fit w-full sticky top-0 ">
        <div className="absolute text-sm top-0 left-0 text-white p-5 flex w-screen justify-between bg-gradient-to-b from-black to-transparent">
          <p>Section: {artifact.zoneName}</p>
          <div className="flex gap-2">
            <button
              className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center"
              onClick={handleBookmark}
            >
              <BookmarkIcon className="h-3 w-3 flex justify-center items-center" />
            </button>
            <button
              className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center"
              onClick={handledDownloads}
            >
              <DownloadsIcon className="h-3 w-3 flex justify-center items-center" />
            </button>
          </div>
        </div>
        {artifact.profilePicture && (
          // <img
          //   src={artifact.profilePicture}
          //   alt={artifact.nameOfArtifact}
          //   className="w-full h-[70vh] object-cover"
          // />
          <div
            style={{
              backgroundImage: `url(${artifact.profilePicture})`,
            }}
            className="w-screen h-[70vh] bg-cover bg-center bg-no-repeat"
          />
        )}
      </div>

      {/* Content */}
      <div className="w-screen h-fit -mt-56">
        {/* Title and Description */}
        <div className="text-white relative h-fit w-full bg-gradient-to-t from-black via-black/75 to-transparent flex flex-col items-start pl-5 pt-5">
          <div className="flex flex-col gap-1 pb-25">
            <h1 className="text-4xl font-title leading-tight">
              {artifact.nameOfArtifact}
            </h1>
            <h2 className="text-sm font-inter whitespace-nowrap">
              {artifact.briefDescription.substring(0, 43)}
            </h2>
          </div>
        </div>
        <div className="w-screen rounded-t-3xl relative border h-fit min-h-96 bg-[#D9D9D9] -mt-15">
          {/* Tabs */}
          <div className="flex relative overflow-x-auto no-scrollbar mb-6 px-5 w-full -mt-5">
            {artifact.sections.map((section, index) => (
              <button
                key={index}
                className={`px-6 py-4 text-sm border  rounded-full w-fit text-nowrap ${
                  activeTab === index
                    ? "bg-black text-white"
                    : "bg-[#F0E9E9] text-black"
                } mr-2`}
                onClick={() => setActiveTab(index)}
                style={{
                  display: `${
                    showDownloadModal ? "none" : "block"
                  }`,
                }}
              >
                {section.title}
              </button>
            ))}
            <button
              className={`px-6 py-4 text-sm border  rounded-full w-fit text-nowrap ${
                activeTab === artifact.sections.length
                  ? "bg-black text-white"
                  : "bg-[#F0E9E9] text-black"
              } mr-2`}
              onClick={() =>
                setActiveTab(artifact.sections.length)
              }
              style={{
                display: `${
                  showDownloadModal ? "none" : "block"
                }`,
              }}
            >
              Gallery
            </button>
          </div>
          {/* Tab Content */}
          <div className="flex w-screen px-10">
            {artifact.sections.map((section, index) => (
              <div
                key={index}
                className={`max-h-96 overflow-y-auto ${
                  activeTab === index ? "block" : "hidden"
                }`}
              >
                <h2 className="text-3xl mb-3 font-semibold font-title antialiased">
                  {section.title}
                </h2>
                <div className="text-sm font-inter whitespace-pre-line antialiased">
                  <p>{section.content}</p>
                </div>
              </div>
            ))}
            <div
              className={`${
                activeTab === artifact.sections.length
                  ? "block"
                  : "hidden"
              } mb-6`}
            >
              {artifact.mediaGallery.images.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Image Gallery
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {artifact.mediaGallery.images.map(
                      (image, index) => (
                        <div
                          key={index}
                          className="aspect-w-16 aspect-h-9"
                        >
                          <img
                            src={`/api/media/${image.fileName}`}
                            alt={`Gallery image ${
                              index + 1
                            }`}
                            className="object-cover rounded-lg"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
              {artifact.mediaGallery.videos.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Video Gallery
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {artifact.mediaGallery.videos.map(
                      (video, index) => (
                        <div
                          key={index}
                          className="aspect-w-16 aspect-h-9"
                        >
                          <video
                            src={`/api/media/${video.fileName}`}
                            controls
                            className="w-full rounded-lg"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-screen bg-gradient-to-t from-[#D9D9D9] via-[#D9D9D9] to-[#d9d9d962] h-10 sticky bottom-0 " />
        </div>
      </div>
    </div>
  );
}

export default ArtifactDetails;
