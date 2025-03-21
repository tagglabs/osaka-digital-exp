import mongoose from "mongoose";

// Define interface for type safety
export interface IArtifact {
  zoneName: string;
  artifactName: string;
  description?: string;
  profilePicture: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  pdfs: string[];
  mediaGallery: string[];
  externalURL?: string;
  createdAt: Date;
}

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
    profilePicture: {
      type: String,
      required: [true, "Profile picture URL is required"],
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
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one PDF is required",
      },
    },
    mediaGallery: {
      type: [String],
      required: true,
      validate: {
        validator: function (v: string[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one media file is required",
      },
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
