import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Artifact, APIResponse } from "../types/artifacts";
import bookmark from "../assets/bookmark.svg";

function ArtifactDetails() {
  const { id } = useParams<{ id: string }>();
  const [artifact, setArtifact] = useState<Artifact | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [topPosition, setTopPosition] = useState("9rem");

  useEffect(() => {
    if (titleRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(titleRef.current).lineHeight,
      );
      const height = titleRef.current.offsetHeight;
      const lineCount = Math.round(height / lineHeight);

      // Adjust top position based on the number of lines
      const topValues: { [key: number]: string } = {
        1: "-8rem",
        2: "-11.5rem",
        3: "-14rem",
      };

      setTopPosition(topValues[lineCount] || "14rem"); // Default to 3-line value if more
    }
  }, [artifact?.nameOfArtifact]);

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
    <div className="w-screen mx-auto -z-20">
      {/* Image Content */}
      <div className="flex h-fit w-full -z-10 sticky top-0">
        {artifact.profilePicture && (
          <img
            src={artifact.profilePicture}
            alt={artifact.nameOfArtifact}
            className="w-full h-[70vh] object-cover z-0"
          />
        )}
        <div className="absolute text-sm top-0 left-0 text-white p-5 flex w-screen justify-between bg-gradient-to-b from-black to-transparent">
          <p>Section: {artifact.zoneName}</p>
          <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center">
            <img
              src={bookmark}
              alt=""
              className="w-3 h-3"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-screen -mt-3 relative">
        <div className="w-screen rounded-t-3xl bg-[#D9D9D9] -mt-3 z-50">
          {/* Tabs */}
          <div className="flex z-50 overflow-x-auto no-scrollbar -mt-3 mb-6 px-5 w-full absolute -top-3">
            {artifact.sections.map((section, index) => (
              <button
                key={index}
                className={`px-6 py-4 text-sm border z-50 rounded-full w-fit text-nowrap ${
                  activeTab === index
                    ? "bg-black text-white"
                    : "bg-[#F0E9E9] text-black"
                } mr-2`}
                onClick={() => setActiveTab(index)}
              >
                {section.title}
              </button>
            ))}
            <button
              className={`px-6 py-4 text-sm border z-50 rounded-full w-fit text-nowrap ${
                activeTab === artifact.sections.length
                  ? "bg-black text-white"
                  : "bg-[#F0E9E9] text-black"
              } mr-2`}
              onClick={() =>
                setActiveTab(artifact.sections.length)
              }
            >
              Gallery
            </button>
          </div>
          {/* Tab Content */}
          <div className="flex w-screen px-10 pt-10">
            {artifact.sections.map((section, index) => (
              <div
                key={index}
                className={`max-h-72 overflow-y-auto ${
                  activeTab === index ? "block" : "hidden"
                }`}
              >
                <h2 className="text-3xl mb-3 font-semibold font-title antialiased">
                  {section.title}
                </h2>
                <div className="text-sm font-inter antialiased">
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
              {artifact.uploads.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Additional Files
                  </h2>
                  <div className="space-y-2">
                    {artifact.uploads.map(
                      (upload, index) => (
                        <a
                          key={index}
                          href={upload.fileURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                        >
                          Download File {index + 1}
                        </a>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-screen bg-gradient-to-t from-[#D9D9D9] via-[#D9D9D9] to-[#d9d9d962] h-10 sticky bottom-0 z-50" />
        </div>

        {/* Title and Description */}
        <div
          className="text-white -z-10 h-96 w-full absolute bg-gradient-to-t from-black to-transparent flex flex-col items-start pl-5 pt-5"
          style={{ top: topPosition }}
        >
          <div className="flex flex-col gap-1 pb-20">
            <h1
              ref={titleRef}
              className="text-4xl font-title leading-tight"
            >
              {artifact.nameOfArtifact}
            </h1>
            <h2 className="text-sm font-inter whitespace-nowrap">
              {artifact.briefDescription.substring(0, 43)}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArtifactDetails;
