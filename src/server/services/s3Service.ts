import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  s3Client,
  s3Config,
  uploadConfig,
  errorMessages,
} from "../config/index.js";
import crypto from "crypto";
import path from "path";

class S3ServiceError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "S3ServiceError";
  }
}

export class S3Service {
  private static generateUniqueFileName(
    originalName: string,
  ): string {
    const timestamp = Date.now();
    const hash = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(originalName);
    return `${timestamp}-${hash}${ext}`;
  }

  private static async uploadToS3(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: s3Config.bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
    });

    try {
      await s3Client.send(command);
      return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("S3 upload error:", error);
      throw new S3ServiceError(
        errorMessages.S3_ERROR,
        error,
      );
    }
  }

  static async uploadFile(
    file: Express.Multer.File,
    type: "image" | "video" | "pdf",
  ): Promise<{ fileURL: string }> {
    try {
      // Validate file type
      const mimeType = file.mimetype;
      const validTypes =
        type === "image"
          ? uploadConfig.allowedImageTypes
          : type === "video"
          ? uploadConfig.allowedVideoTypes
          : uploadConfig.allowedPdfTypes;

      if (!validTypes.includes(mimeType)) {
        throw new S3ServiceError(
          `Invalid ${type} file type. Allowed types: ${validTypes.join(
            ", ",
          )}`,
        );
      }

      // Validate file size
      if (file.size > uploadConfig.maxFileSize) {
        throw new S3ServiceError(
          `File size exceeds maximum limit of ${
            uploadConfig.maxFileSize / (1024 * 1024)
          }MB`,
        );
      }

      // Generate unique filename with proper folder structure
      const fileName = this.generateUniqueFileName(
        file.originalname,
      );
      const folderPath =
        type === "image"
          ? "images/"
          : type === "video"
          ? "videos/"
          : "pdfs/";
      const fullPath = folderPath + fileName;

      // Upload to S3
      const fileURL = await this.uploadToS3(
        file.buffer,
        fullPath,
        file.mimetype,
      );

      return { fileURL };
    } catch (error) {
      if (error instanceof S3ServiceError) {
        throw error;
      }
      throw new S3ServiceError(
        errorMessages.UPLOAD_FAILED,
        error,
      );
    }
  }

  static async generatePresignedUrl(
    fileName: string,
    contentType: string,
    operation: "upload" | "download" = "upload",
  ): Promise<string> {
    try {
      const command =
        operation === "upload"
          ? new PutObjectCommand({
              Bucket: s3Config.bucketName,
              Key: fileName,
              ContentType: contentType,
            })
          : new GetObjectCommand({
              Bucket: s3Config.bucketName,
              Key: fileName,
            });

      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      }); // 1 hour
      return url;
    } catch (error) {
      console.error(
        "Error generating presigned URL:",
        error,
      );
      throw new S3ServiceError(
        "Failed to generate presigned URL",
        error,
      );
    }
  }

  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      const key = new URL(fileUrl).pathname.slice(1);
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucketName,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw new S3ServiceError(
        "Failed to delete file from S3",
        error,
      );
    }
  }
}
