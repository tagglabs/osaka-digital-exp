import mongoose from "mongoose";

// Define interfaces for file metadata
interface FileMetadata {
  originalName: string;
  fileName: string;
  fileSize: number;
  extension: string;
  mimeType: string;
  fileURL: string;
  preview?: string;
  uploadDate: Date;
}

// Define interface for type safety
export interface IArtifact {
  zoneName: string;
  artifactName: string;
  description?: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  pdfs?: FileMetadata[];
  mediaGallery?: FileMetadata[];
  externalURL?: string;
  createdAt: Date;
}

// Create schema for file metadata
const fileMetadataSchema =
  new mongoose.Schema<FileMetadata>(
    {
      originalName: { type: String, required: true },
      fileName: { type: String, required: true },
      fileSize: { type: Number, required: true },
      extension: { type: String, required: true },
      mimeType: { type: String, required: true },
      fileURL: { type: String, required: true },
      preview: { type: String },
      uploadDate: { type: Date, required: true },
    },
    { _id: false },
  );

// Create schema with proper typings
const artifactSchema = new mongoose.Schema<IArtifact>(
  {
    zoneName: {
      type: String,
      required: true,
      minlength: [
        3,
        "Zone name must be at least 3 characters long",
      ],
    },
    artifactName: {
      type: String,
      required: true,
      minlength: [
        3,
        "Artifact name must be at least 3 characters long",
      ],
    },
    description: {
      type: String,
      required: false,
    },
    sections: [
      {
        title: {
          type: String,
          required: [true, "Section title is required"],
        },
        content: {
          type: String,
          required: [true, "Section content is required"],
        },
        _id: false, // Disable auto _id for subdocuments
      },
    ],
    pdfs: {
      type: [fileMetadataSchema],
      required: false,
    },
    mediaGallery: {
      type: [fileMetadataSchema],
      required: false,
    },
    externalURL: {
      type: String,
      required: false,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow empty
          return Boolean(
            v.match(/^https?:\/\/.+\..+$/), // Basic URL validation
          );
        },
        message: "Invalid URL format",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id; // Map _id to id
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Add any indexes if needed
artifactSchema.index(
  { zoneName: 1, artifactName: 1 },
  { unique: true },
);
artifactSchema.index({ createdAt: -1 });

// Export both interface and model
export const Artifact = mongoose.model<IArtifact>(
  "Artifact",
  artifactSchema,
);
