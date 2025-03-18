import mongoose, { Document, Schema } from "mongoose";
import { Artifact } from "../../types/artifacts";

// Create interface for Mongoose document
// Omit _id from Artifact since it will be provided by Document
export interface ArtifactDocument
  extends Omit<Artifact, "_id">,
    Document {}

const sectionSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const fileUploadSchema = new Schema({
  fileURL: { type: String, required: true },
});

const mediaFileSchema = new Schema({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
});

const mediaGallerySchema = new Schema({
  images: [mediaFileSchema],
  videos: [mediaFileSchema],
});

const artifactSchema = new Schema(
  {
    zoneName: { type: String, required: true },
    nameOfArtifact: { type: String, required: true },
    briefDescription: { type: String, required: true },
    profilePicture: { type: String },
    sections: [sectionSchema],
    uploads: [fileUploadSchema],
    mediaGallery: mediaGallerySchema,
    url: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Create indexes for better query performance
artifactSchema.index({ zoneName: 1 });
artifactSchema.index({ nameOfArtifact: 1 });

// Add any custom methods or virtuals here if needed
artifactSchema.virtual("fullUrl").get(function () {
  return this.url
    ? `${process.env.BASE_URL || ""}${this.url}`
    : null;
});

export const ArtifactModel =
  mongoose.model<ArtifactDocument>(
    "Artifact",
    artifactSchema,
  );
