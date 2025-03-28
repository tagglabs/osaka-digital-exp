import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Trash from "../assets/trash.png";
import { Button } from "../Components/Button";
import Modal from "../Components/Modal";
import { FormData, FileType } from "../types/artifacts";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteItemId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;

    try {
      const response = await axios.delete(`/api/artifacts/${deleteItemId}`);
      
      // Status 204 indicates successful deletion with no content
      if (response.status === 204) {
        setArtifacts(artifacts.filter(artifact => artifact.id !== deleteItemId));
        toast.success("Artifact deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting artifact:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          toast.error("Artifact not found");
        } else {
          toast.error("Failed to delete artifact. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setShowDeleteModal(false);
      setDeleteItemId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteItemId(null);
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
          showIcon
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
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        title="Delete Artifact"
      >
        <div className="p-4">
          <p className="mb-4">Are you sure you want to delete this artifact?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={handleDeleteCancel}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer position="bottom-right" />
    </div>
  );
};
