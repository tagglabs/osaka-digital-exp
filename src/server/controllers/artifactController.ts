import { Request, Response } from "express";
import { Artifact } from "../models/Artifact";
import { S3Service } from "../services/s3Service";
import { z } from "zod";
import { errorMessages } from "../config";
import { artifactSchema } from "../../types/artifacts";

// Validation schema
const artifactValidationSchema = artifactSchema;

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
      const validatedData = artifactValidationSchema.parse(
        req.body,
      );

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

      // Delete files from S3 including profile picture if it exists
      const filesToDelete = [
        ...(artifact.pdfs?.map((file) => file.fileURL) ||
          []),
        ...(artifact.mediaGallery?.map(
          (file) => file.fileURL,
        ) || []),
        ...(artifact.profilePicture?.fileURL
          ? [artifact.profilePicture.fileURL]
          : []),
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

  // Edit artifact
  async editArtifact(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = artifactValidationSchema.parse(
        req.body,
      );

      // Get original artifact
      const originalArtifact = await Artifact.findById(
        req.params.id,
      );
      if (!originalArtifact) {
        throw new ApiError(404, errorMessages.NOT_FOUND);
      }

      // Find files to delete (files in original but not in new data)
      const filesToDelete: string[] = [];

      // Check profile picture
      if (originalArtifact.profilePicture?.fileURL) {
        if (
          !validatedData.profilePicture ||
          originalArtifact.profilePicture.fileURL !==
            validatedData.profilePicture.fileURL
        ) {
          filesToDelete.push(
            originalArtifact.profilePicture.fileURL,
          );
        }
      }

      // Check PDFs
      const oldPdfUrls =
        originalArtifact.pdfs?.map((pdf) => pdf.fileURL) ||
        [];
      const newPdfUrls =
        validatedData.pdfs?.map((pdf) => pdf.fileURL) || [];
      oldPdfUrls.forEach((url) => {
        if (!newPdfUrls.includes(url)) {
          filesToDelete.push(url);
        }
      });

      // Check media gallery
      const oldMediaUrls =
        originalArtifact.mediaGallery?.map(
          (media) => media.fileURL,
        ) || [];
      const newMediaUrls =
        validatedData.mediaGallery?.map(
          (media) => media.fileURL,
        ) || [];
      oldMediaUrls.forEach((url) => {
        if (!newMediaUrls.includes(url)) {
          filesToDelete.push(url);
        }
      });

      // Check audio guide
      if (
        originalArtifact.audioGuide?.fileURL &&
        (!validatedData.audioGuide ||
          originalArtifact.audioGuide.fileURL !==
            validatedData.audioGuide.fileURL)
      ) {
        filesToDelete.push(
          originalArtifact.audioGuide.fileURL,
        );
      }

      // Delete removed files from S3
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map((fileUrl) =>
            S3Service.deleteFile(fileUrl),
          ),
        );
      }

      // Update artifact in database
      const updatedArtifact =
        await Artifact.findByIdAndUpdate(
          req.params.id,
          {
            ...validatedData,
            updatedAt: new Date(),
          },
          { new: true },
        );

      res.json(updatedArtifact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ApiError(
          400,
          JSON.stringify(error.errors),
        );
      }
      if (error instanceof ApiError) {
        throw error;
      }
      console.error("Edit artifact error:", error);
      throw new ApiError(
        500,
        error instanceof Error
          ? error.message
          : errorMessages.DATABASE_ERROR,
      );
    }
  },
};
