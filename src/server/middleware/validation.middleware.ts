import { Request, Response, NextFunction } from "express";
import {
  CreateArtifactDTO,
  UpdateArtifactDTO,
} from "../../types/artifacts";

export const validateArtifact = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const data = req.body as
      | CreateArtifactDTO
      | UpdateArtifactDTO;

    // For creation, check required fields
    if (req.method === "POST") {
      const requiredFields = [
        "zoneName",
        "nameOfArtifact",
        "briefDescription",
      ];
      const missingFields = requiredFields.filter(
        (field) => !data[field as keyof CreateArtifactDTO],
      );

      if (missingFields.length > 0) {
        res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(
            ", ",
          )}`,
        });
        return;
      }
    }

    // Validate sections if present
    if (data.sections) {
      for (const section of data.sections) {
        if (!section.title || !section.content) {
          res.status(400).json({
            success: false,
            error:
              "Each section must have a title and content",
          });
          return;
        }
      }
    }

    // Validate media gallery if present
    if (data.mediaGallery) {
      const { images, videos } = data.mediaGallery;

      if (images && !Array.isArray(images)) {
        res.status(400).json({
          success: false,
          error: "Images must be an array",
        });
        return;
      }

      if (videos && !Array.isArray(videos)) {
        res.status(400).json({
          success: false,
          error: "Videos must be an array",
        });
        return;
      }
    }

    // Validate uploads if present
    if (data.uploads) {
      if (!Array.isArray(data.uploads)) {
        res.status(400).json({
          success: false,
          error: "Uploads must be an array",
        });
        return;
      }

      for (const upload of data.uploads) {
        if (!upload.fileURL) {
          res.status(400).json({
            success: false,
            error: "Each upload must have a fileURL",
          });
          return;
        }
      }
    }

    next();
  } catch (error) {
    console.error("Validation error:", error);
    res.status(400).json({
      success: false,
      error: "Invalid request data",
    });
  }
};
