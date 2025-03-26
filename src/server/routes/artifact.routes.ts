import { Router } from "express";
import multer from "multer";
import type { RequestHandler } from "express";
import { artifactController } from "../controllers/artifactController.js";
import { uploadConfig } from "../config/index.js";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

// Helper to wrap async handlers
const asyncHandler = (
  fn: RequestHandler,
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// File upload route
router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(
    artifactController.uploadFile as RequestHandler,
  ),
);

// Artifact routes
router.post(
  "/artifacts",
  asyncHandler(
    artifactController.createArtifact as RequestHandler,
  ),
);

router.get(
  "/artifacts",
  asyncHandler(
    artifactController.getAllArtifacts as RequestHandler,
  ),
);

router.get(
  "/artifacts/:id",
  asyncHandler(
    artifactController.getArtifact as RequestHandler,
  ),
);

router.delete(
  "/artifacts/:id",
  asyncHandler(
    artifactController.deleteArtifact as RequestHandler,
  ),
);

// Edit artifact route
router.put(
  "/artifacts/:id",
  asyncHandler(
    artifactController.editArtifact as RequestHandler,
  ),
);

export default router;
