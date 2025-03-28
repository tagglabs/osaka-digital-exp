// Core file details interface
export interface FileDetails {
  originalName: string;
  fileName: string;
  fileSize: number;
  extension: string;
  mimeType: string;
  fileURL: string;
  preview: string;
}

// Media files structure
export interface MediaGallery {
  images: FileDetails[];
  videos: FileDetails[];
}

// Storage state for selected files before upload
export interface FileStorageState {
  profilePicture: File | null;
  audioGuide: File | null;
  pdfs: File[];
  media: {
    images: File[];
    videos: File[];
  };
}

// Upload result structure
export interface UploadResult {
  profilePicture?: FileDetails;
  audioGuide?: FileDetails;
  pdfs: FileDetails[];
  mediaGallery: MediaGallery;
}

// File type constant
export type FileType =
  | "profile"
  | "pdf"
  | "image"
  | "video"
  | "audio";

// Upload Manager Interface
export interface UploadManager {
  // File management before upload
  addFile: (type: FileType, files: File[]) => void;
  removeFile: (type: FileType, fileName: string) => void;

  // Get current selected files
  getSelectedFiles: () => FileStorageState;

  // Main upload operation
  uploadAll: () => Promise<UploadResult>;

  // Reset state
  reset: () => void;
}
