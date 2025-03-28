import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FileType } from "../types/artifacts";
import { BookmarkIcon, MenuIcon } from "../utils/icons";
import ArtifactMediaModal from "../Components/ArtifactMediaModal";
interface Artifact {
  zoneName: string;
  artifactName: string;
  description: string;
  profilePicture?: FileType;
  sections: Array<{
    title: string;
    content: string;
  }>;
  pdfs?: FileType[];
  mediaGallery?: FileType[];
  referenceLinks?: string[];
  audioGuide?: FileType;
}

function ArtifactDetails() {
  const { id } = useParams<{ id: string }>();
  const [artifact, setArtifact] = useState<Artifact | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showMediaModal, setShowMediaModal] =
    useState(false);

  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const { data } = await axios.get(
          `/api/artifacts/${id}`,
        );

        if (!data) {
          throw new Error("Failed to fetch artifact");
        }

        setArtifact(data);
        setError(null);
      } catch (err) {
        setError(
          axios.isAxiosError(err)
            ? err.response?.data?.message || err.message
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

  const handleMediaModal = () => {
    setShowMediaModal(true);
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
      {/* Media Modal */}
      <ArtifactMediaModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title={artifact.artifactName}
        description={artifact.description}
        mediaGallery={artifact.mediaGallery}
        pdfs={artifact.pdfs}
        referenceLinks={artifact.referenceLinks}
        audioGuide={artifact.audioGuide}
      />

      {/* Image Content */}
      <div className="flex h-fit w-full sticky top-0 ">
        <div className="absolute text-sm top-0 left-0 text-white p-5 flex w-screen justify-between bg-gradient-to-b from-black to-transparent">
          <p>Section: {artifact.zoneName}</p>
          <div className="flex gap-2">
            <button
              onClick={handleMediaModal}
              className="text-white"
            >
              <MenuIcon className="h-5 w-5 flex justify-center items-center" />
            </button>
            <button
              className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center"
              onClick={handleBookmark}
            >
              <BookmarkIcon className="h-3 w-3 flex justify-center items-center" />
            </button>
          </div>
        </div>
        {artifact.profilePicture && (
          <div
            style={{
              backgroundImage: `url(${artifact.profilePicture.fileURL})`,
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
              {artifact.artifactName}
            </h1>
            <h2 className="text-sm font-inter whitespace-nowrap">
              {artifact.description.substring(0, 43)}
            </h2>
          </div>
        </div>
        <div className="w-screen rounded-t-3xl relative border h-fit min-h-96 bg-[#D9D9D9] -mt-15">
          {/* Tabs */}
          <div className="flex relative overflow-x-auto no-scrollbar mb-6 px-5 w-full -mt-5">
            {artifact.sections.map((section, index) => (
              <button
                key={index}
                className={`px-5 py-3 text-sm border font-gilroy rounded-full w-fit text-nowrap ${
                  activeTab === index
                    ? "bg-black text-white"
                    : "bg-[#F0E9E9] text-black"
                } mr-2`}
                onClick={() => setActiveTab(index)}
              >
                {section.title}
              </button>
            ))}
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
            ></div>
          </div>
          <div className="w-screen bg-gradient-to-t from-[#D9D9D9] via-[#D9D9D9] to-[#d9d9d962] h-10 sticky bottom-0 " />
        </div>
      </div>
    </div>
  );
}

export default ArtifactDetails;
