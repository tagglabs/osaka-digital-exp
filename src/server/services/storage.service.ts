import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import type { MediaFile } from "../../types/artifacts.js";

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || "uploads";
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error(
        "Error creating upload directory:",
        error,
      );
    }
  }

  public getUploader() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix =
          Date.now() +
          "-" +
          Math.round(Math.random() * 1e9);
        cb(
          null,
          `${file.fieldname}-${uniqueSuffix}${path.extname(
            file.originalname,
          )}`,
        );
      },
    });

    return multer({
      storage,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        // Accept images and videos
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "video/mp4",
          "video/quicktime",
        ];

        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error("Invalid file type"));
        }
      },
    });
  }

  public async deleteFile(filename: string): Promise<void> {
    try {
      await unlink(path.join(this.uploadDir, filename));
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  public getFileInfo(file: Express.Multer.File): MediaFile {
    return {
      fileName: file.filename,
      fileSize: file.size,
    };
  }

  public getFileUrl(filename: string): string {
    return `/${this.uploadDir}/${filename}`;
  }
}
