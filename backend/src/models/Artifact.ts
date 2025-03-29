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
  artifactNameJap?: string;
  description: string;
  descriptionJap?: string;
  sections: Array<{
    title: string;
    titleJap?: string;
    content: string;
    contentJap?: string;
  }>;
  profilePicture: FileMetadata;
  pdfs?: FileMetadata[];
  audioGuide?: FileMetadata;
  referenceLinks?: string[];
  mediaGallery?: FileMetadata[];
  externalURL?: string;
  createdAt: Date;
}

// Create schema for file metadata
const fileMetadataSchema = new mongoose.Schema<FileMetadata>(
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
  { _id: false }
);

// Allowed zone names
const ALLOWED_ZONES = [
  "zone1",
  "zone2",
  "zone3",
  "zone4",
  "zone5",
  "zone6",
  "zone7",
  "zone8",
  "zone9",
];

// Create schema with proper typings
const artifactSchema = new mongoose.Schema<IArtifact>(
  {
    zoneName: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return ALLOWED_ZONES.includes(v);
        },
        message: "Zone name must be one of: " + ALLOWED_ZONES.join(", "),
      },
    },
    artifactName: {
      type: String,
      required: true,
    },
    artifactNameJap: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    descriptionJap: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: fileMetadataSchema,
      required: false,
    },
    sections: [
      {
        title: {
          type: String,
          required: false,
        },
        titleJap: {
          type: String,
          required: false,
        },
        content: {
          type: String,
          required: false,
        },
        contentJap: {
          type: String,
          required: false,
        },
        _id: false, // Disable auto _id for subdocuments
      },
    ],
    pdfs: {
      type: [fileMetadataSchema],
      default: [],
    },
    audioGuide: {
      type: fileMetadataSchema,
      required: false,
    },
    referenceLinks: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.every(
            (link) => !link || Boolean(link.match(/^https?:\/\/.+\..+$/))
          );
        },
        message: "Invalid URL format in reference links",
      },
    },
    mediaGallery: {
      type: [fileMetadataSchema],
      default: [],
    },
    externalURL: {
      type: String,
      required: false,
      validate: {
        validator: function (v: string) {
          if (!v) return true; // Allow empty
          return Boolean(v.match(/^https?:\/\/.+\..+$/)); // Basic URL validation
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
  }
);

// Add any indexes if needed
artifactSchema.index({ createdAt: -1 });

// Export both interface and model
export const Artifact = mongoose.model<IArtifact>("Artifact", artifactSchema);
