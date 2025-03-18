export interface Section {
  title: string;
  content: string;
}

export interface FileUpload {
  fileURL: string;
}

export interface MediaFile {
  fileName: string;
  fileSize: number;
}

export interface MediaGallery {
  images: MediaFile[];
  videos: MediaFile[];
}

export interface Artifact {
  _id?: string;
  zoneName: string;
  nameOfArtifact: string;
  briefDescription: string;
  profilePicture?: string;
  sections: Section[];
  uploads: FileUpload[];
  mediaGallery: MediaGallery;
  url?: string;
}

// Use type instead of interface for DTO to properly handle Omit
export type CreateArtifactDTO = Omit<Artifact, "_id">;

// Partial makes all fields optional for updates
export type UpdateArtifactDTO = Partial<CreateArtifactDTO>;

// S3 related types
export interface PresignedUploadURL {
  uploadURL: string;
  fileKey: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
