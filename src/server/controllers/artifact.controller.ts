import { Request, Response } from "express";
import { ArtifactModel } from "../models/artifact.model.js";
import { StorageService } from "../services/storage.service.js";
import type {
  CreateArtifactDTO,
  UpdateArtifactDTO,
} from "../../types/artifacts.js";

class ArtifactController {
  private storageService: StorageService;

  constructor() {
    this.storageService = new StorageService();
  }

  public getUploader() {
    return this.storageService.getUploader();
  }

  public getAllArtifacts = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const artifacts = await ArtifactModel.find().sort({
        createdAt: -1,
      });
      res.json({ success: true, data: artifacts });
    } catch (error) {
      console.error("Error fetching artifacts:", error);
      res
        .status(500)
        .json({
          success: false,
          error: "Error fetching artifacts",
        });
    }
  };

  public getArtifactById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const artifact = await ArtifactModel.findById(
        req.params.id,
      );
      if (!artifact) {
        res
          .status(404)
          .json({
            success: false,
            error: "Artifact not found",
          });
        return;
      }
      res.json({ success: true, data: artifact });
    } catch (error) {
      console.error(
        "Error fetching artifact by ID:",
        error,
      );
      res
        .status(500)
        .json({
          success: false,
          error: "Error fetching artifact",
        });
    }
  };

  public createArtifact = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const artifactData: CreateArtifactDTO = req.body;

      // Handle file uploads if present
      if (req.files) {
        const files = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();

        // Process profile picture
        const profilePicture = files.find(
          (file) => file.fieldname === "profilePicture",
        );
        if (profilePicture) {
          artifactData.profilePicture =
            this.storageService.getFileUrl(
              profilePicture.filename,
            );
        }

        // Process media gallery
        const images = files.filter(
          (file) => file.fieldname === "images",
        );
        const videos = files.filter(
          (file) => file.fieldname === "videos",
        );

        artifactData.mediaGallery = {
          images: images.map((file) =>
            this.storageService.getFileInfo(file),
          ),
          videos: videos.map((file) =>
            this.storageService.getFileInfo(file),
          ),
        };

        // Process other uploads
        const uploads = files.filter(
          (file) => file.fieldname === "uploads",
        );
        artifactData.uploads = uploads.map((file) => ({
          fileURL: this.storageService.getFileUrl(
            file.filename,
          ),
        }));
      }

      const artifact = new ArtifactModel(artifactData);
      await artifact.save();
      res
        .status(201)
        .json({ success: true, data: artifact });
    } catch (error) {
      console.error("Error creating artifact:", error);
      res
        .status(500)
        .json({
          success: false,
          error: "Error creating artifact",
        });
    }
  };

  public updateArtifact = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const updateData: UpdateArtifactDTO = req.body;

      if (req.files) {
        const files = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();

        if (
          files.find(
            (file) => file.fieldname === "profilePicture",
          )
        ) {
          updateData.profilePicture =
            this.storageService.getFileUrl(
              files.find(
                (file) =>
                  file.fieldname === "profilePicture",
              )!.filename,
            );
        }

        const images = files.filter(
          (file) => file.fieldname === "images",
        );
        const videos = files.filter(
          (file) => file.fieldname === "videos",
        );

        if (images.length || videos.length) {
          updateData.mediaGallery = {
            images: images.map((file) =>
              this.storageService.getFileInfo(file),
            ),
            videos: videos.map((file) =>
              this.storageService.getFileInfo(file),
            ),
          };
        }

        const uploads = files.filter(
          (file) => file.fieldname === "uploads",
        );
        if (uploads.length) {
          updateData.uploads = uploads.map((file) => ({
            fileURL: this.storageService.getFileUrl(
              file.filename,
            ),
          }));
        }
      }

      const artifact =
        await ArtifactModel.findByIdAndUpdate(
          req.params.id,
          updateData,
          { new: true },
        );

      if (!artifact) {
        res
          .status(404)
          .json({
            success: false,
            error: "Artifact not found",
          });
        return;
      }

      res.json({ success: true, data: artifact });
    } catch (error) {
      console.error("Error updating artifact:", error);
      res
        .status(500)
        .json({
          success: false,
          error: "Error updating artifact",
        });
    }
  };

  public deleteArtifact = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const artifact = await ArtifactModel.findById(
        req.params.id,
      );
      if (!artifact) {
        res
          .status(404)
          .json({
            success: false,
            error: "Artifact not found",
          });
        return;
      }

      if (artifact.profilePicture) {
        await this.storageService.deleteFile(
          artifact.profilePicture.split("/").pop()!,
        );
      }

      for (const upload of artifact.uploads) {
        await this.storageService.deleteFile(
          upload.fileURL.split("/").pop()!,
        );
      }

      for (const image of artifact.mediaGallery.images) {
        await this.storageService.deleteFile(
          image.fileName,
        );
      }

      for (const video of artifact.mediaGallery.videos) {
        await this.storageService.deleteFile(
          video.fileName,
        );
      }

      await artifact.deleteOne();
      res.json({
        success: true,
        data: "Artifact deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artifact:", error);
      res
        .status(500)
        .json({
          success: false,
          error: "Error deleting artifact",
        });
    }
  };
}

export const artifactController = new ArtifactController();
