import { FileType } from "./artifacts";

// Extends the base FileType to match component expectations
export interface FileWithPreview extends FileType {
  file: File;
  preview: string;
  progress: number;
  error?: string;
  isUploading: boolean;
  uploaded: boolean;
}

export interface MediaState {
  images: FileWithPreview[];
  videos: FileWithPreview[];
}

// Upload Manager State
export interface UploadManagerState {
  profilePicture: FileWithPreview | null;
  pdfs: FileWithPreview[];
  media: MediaState;
}

// Upload Status for tracking overall form state
export interface UploadStatus {
  isUploading: boolean;
  hasErrors: boolean;
  totalFiles: number;
  uploadedFiles: number;
}

// Upload Manager Actions
export type UploadAction =
  | {
      type: "ADD_FILE";
      payload: {
        fileType: "profile" | "pdf" | "image" | "video";
        file: File;
      };
    }
  | {
      type: "UPDATE_PROGRESS";
      payload: { fileId: string; progress: number };
    }
  | {
      type: "SET_ERROR";
      payload: { fileId: string; error: string };
    }
  | {
      type: "SET_UPLOADED";
      payload: { fileId: string; fileURL: string };
    }
  | {
      type: "REMOVE_FILE";
      payload: {
        fileType: "profile" | "pdf" | "image" | "video";
        fileId: string;
      };
    }
  | { type: "RESET_ALL" };

// Upload Manager Interface
export interface UploadManager {
  // File management
  addFile: (
    type: "profile" | "pdf" | "image" | "video",
    files: File[],
  ) => void;
  removeFile: (
    type: "profile" | "pdf" | "image" | "video",
    fileId: string,
  ) => void;

  // Status and data
  getStatus: () => UploadStatus;
  getFiles: () => {
    profilePicture: FileWithPreview | null;
    pdfs: FileWithPreview[];
    mediaFiles: MediaState;
  };

  // Operations
  uploadAll: () => Promise<void>;
  reset: () => void;
}

// Utility type for component props
export interface FileComponentProps {
  profilePicture: FileWithPreview | null;
  pdfs: FileWithPreview[];
  mediaFiles: MediaState;
  uploadStatus: UploadStatus;
}
