import { Router } from "express";
import { artifactController } from "../controllers/artifact.controller";
import { validateArtifact } from "../middleware/validation.middleware";

const router = Router();
const upload = artifactController.getUploader();

// Configure multer for different file types
const uploadFields = [
  { name: "profilePicture", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
  { name: "uploads", maxCount: 10 },
];

// Get all artifacts
router.get("/", artifactController.getAllArtifacts);

// Get single artifact by ID
router.get("/:id", artifactController.getArtifactById);

// Create new artifact with file uploads
router.post(
  "/",
  upload.fields(uploadFields),
  validateArtifact,
  artifactController.createArtifact,
);

// Update artifact with optional file uploads
router.put(
  "/:id",
  upload.fields(uploadFields),
  validateArtifact,
  artifactController.updateArtifact,
);

// Delete artifact and its associated files
router.delete("/:id", artifactController.deleteArtifact);

export const artifactRoutes = router;
