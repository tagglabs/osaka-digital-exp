import { Request, Response } from "express";
import { Artifact } from "../models/Artifact.js";
import { S3Service } from "../services/s3Service.js";
import { z } from "zod";
import { errorMessages } from "../config/index.js";

// Validation schemas
const fileSchema = z.object({
  originalName: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  extension: z.string(),
  mimeType: z.string(),
  fileURL: z.string(),
  preview: z.string().optional(),
  uploadDate: z.string().datetime(),
});

const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
});

const artifactSchema = z.object({
  zoneName: z
    .string()
    .min(3, "Zone name must be at least 3 characters"),
  artifactName: z
    .string()
    .min(3, "Artifact name must be at least 3 characters"),
  description: z.string().optional(),
  profilePicture: fileSchema,
  sections: z
    .array(sectionSchema)
    .min(1, "At least one section is required"),
  pdfs: z.array(fileSchema).optional(),
  mediaGallery: z.array(fileSchema).optional(),
  externalURL: z.string().url().optional(),
});

// Custom error class
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const artifactController = {
  // Upload file to S3
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new ApiError(400, "No file provided");
      }

      const type = req.body.type as
        | "image"
        | "video"
        | "pdf";
      if (!type) {
        throw new ApiError(400, "File type not specified");
      }

      const result = await S3Service.uploadFile(
        req.file,
        type,
      );
      res.json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Upload error:", error);
      throw new ApiError(
        500,
        error instanceof Error
          ? error.message
          : errorMessages.UPLOAD_FAILED,
      );
    }
  },

  // Create new artifact
  async createArtifact(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = artifactSchema.parse(req.body);

      // Create new artifact
      const artifact = await Artifact.create({
        ...validatedData,
        createdAt: new Date(),
      });

      res.status(201).json(artifact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          400,
          JSON.stringify(error.errors),
        );
      }

      console.error("Create artifact error:", error);
      throw new ApiError(
        500,
        error instanceof Error
          ? error.message
          : errorMessages.DATABASE_ERROR,
      );
    }
  },

  // Get artifact by ID
  async getArtifact(req: Request, res: Response) {
    try {
      const artifact = await Artifact.findById(
        req.params.id,
      );
      if (!artifact) {
        throw new ApiError(404, errorMessages.NOT_FOUND);
      }
      res.json(artifact);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Get artifact error:", error);
      throw new ApiError(
        500,
        error instanceof Error
          ? error.message
          : errorMessages.DATABASE_ERROR,
      );
    }
  },

  // Get all artifacts
  async getAllArtifacts(req: Request, res: Response) {
    try {
      const artifacts = await Artifact.find()
        .sort({ createdAt: -1 }) // Latest first
        .select("-__v"); // Exclude version key
      res.json(artifacts);
    } catch (error) {
      console.error("Get all artifacts error:", error);
      throw new ApiError(
        500,
        error instanceof Error
          ? error.message
          : errorMessages.DATABASE_ERROR,
      );
    }
  },

  // Delete artifact
  async deleteArtifact(req: Request, res: Response) {
    try {
      const artifact = await Artifact.findById(
        req.params.id,
      );
      if (!artifact) {
        throw new ApiError(404, errorMessages.NOT_FOUND);
      }

      // Delete files from S3 including profile picture
      const filesToDelete = [
        ...(artifact.pdfs?.map((file) => file.fileURL) ||
          []),
        ...(artifact.mediaGallery?.map(
          (file) => file.fileURL,
        ) || []),
        artifact.profilePicture.fileURL,
      ];

      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map((fileUrl) =>
            S3Service.deleteFile(fileUrl),
          ),
        );
      }

      // Delete artifact from database
      await Artifact.findByIdAndDelete(req.params.id);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Delete artifact error:", error);
      throw new ApiError(
        500,
        error instanceof Error
          ? error.message
          : errorMessages.DATABASE_ERROR,
      );
    }
  },
};
