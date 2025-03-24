import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Trash from "../assets/trash.png";
import { Button } from "../Components/Button";
import { FormData, FileType } from "../types/artifacts";

// API response types
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ArtifactPreviewProps {
  id: string;
  profilePicture?: FileType;
  zoneName: string;
  artifactName: string;
  description: string;
  onDelete: (id: string) => void;
}

const ArtifactPreview = ({
  id,
  profilePicture,
  zoneName,
  artifactName,
  description,
  onDelete,
}: ArtifactPreviewProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full border-2 border-gray-secondary rounded-md flex justify-between items-start p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 flex-grow">
        <div className="w-[100px] h-[100px] rounded-md overflow-hidden flex-shrink-0">
          <img
            src={profilePicture?.fileURL || '/placeholder-image.jpg'}
            alt={artifactName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-start w-full">
            <div>
              <p className="text-sm text-gray-primary uppercase mb-1">{zoneName}</p>
              <h3 className="text-lg font-semibold mb-2">{artifactName}</h3>
            </div>
          </div>
          <p className="text-gray-600 text-sm line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <button
          onClick={() => navigate(`/edit/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(id)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <img src={Trash} alt="delete" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Extend FormData type to include id for API responses
interface APIArtifact extends FormData {
  id: string;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<APIArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this artifact?")) {
      try {
        const response = await axios.delete<APIResponse<void>>(`/api/artifacts/${id}`);
        if (response.data.success) {
          setArtifacts(artifacts.filter(artifact => artifact.id !== id));
        } else {
          throw new Error(response.data.error || "Failed to delete artifact");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete artifact";
        console.error("Error deleting artifact:", err);
        alert(errorMessage);
      }
    }
  };

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        const response = await axios.get<APIArtifact[]>("/api/artifacts");
        if (response.data) {
          setArtifacts(response.data);
        } else {
          throw new Error("Failed to fetch artifacts");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch artifacts";
        setError(errorMessage);
        console.error("Error fetching artifacts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading artifacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Artifacts Gallery</h1>
        <Button
          placeholder="New Artifact"
          type="button"
          onClick={() => navigate('/cms')}
        />
      </div>
      <div className="grid gap-4">
        {artifacts.map((artifact) => (
          <ArtifactPreview
            key={artifact.id}
            id={artifact.id}
            profilePicture={artifact.profilePicture}
            zoneName={artifact.zoneName}
            artifactName={artifact.artifactName}
            description={artifact.description}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
