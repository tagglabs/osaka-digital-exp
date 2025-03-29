import dotenv from "dotenv";
import { S3Client } from "@aws-sdk/client-s3";

// Load environment variables
dotenv.config();

// // Validate required environment variables
// const requiredEnvVars = [
//   "OSAKAARTIFACT25_CMS_PORT",
//   "OSAKAARTIFACT25_CMS_NODE_ENV",
//   "OSAKAARTIFACT25_CMS_MONGODB_URI",
//   "OSAKAARTIFACT25_CMS_AWS_ACCESS_KEY_ID",
//   "OSAKAARTIFACT25_CMS_AWS_SECRET_ACCESS_KEY",
//   "OSAKAARTIFACT25_CMS_AWS_REGION",
//   "OSAKAARTIFACT25_CMS_AWS_BUCKET_NAME",
//   "OSAKAARTIFACT25_CMS_CORS_ORIGIN",
// ] as const;

// // Check for missing environment variables
// const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
// if (missingVars.length > 0) {
//   throw new Error(
//     `Missing required environment variables: ${missingVars.join(", ")}`,
//   );
// }

// Server configuration
export const serverConfig = {
  port: process.env.OSAKAARTIFACT25_CMS_PORT || 3015,
  nodeEnv: process.env.OSAKAARTIFACT25_CMS_NODE_ENV || "development",
  baseUrl:
    process.env.OSAKAARTIFACT25_CMS_BASE_URL ||
    `http://localhost:${process.env.OSAKAARTIFACT25_CMS_PORT || 3015}`,
};

// MongoDB configuration
export const mongoConfig = {
  uri: "mongodb+srv://ita_b1:VrwhHmKTDAsllELL@serverless2024.mvuamon.mongodb.net/osaka25-artifact-cms?retryWrites=true&w=majority&appName=osaka25-artifact-cms",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

// AWS S3 configuration
export const s3Config = {
  credentials: {
    accessKeyId: process.env.OSAKAARTIFACT25_CMS_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env
      .OSAKAARTIFACT25_CMS_AWS_SECRET_ACCESS_KEY as string,
  },
  region: process.env.OSAKAARTIFACT25_CMS_AWS_REGION as string,
  bucketName: process.env.OSAKAARTIFACT25_CMS_AWS_BUCKET_NAME as string,
};

// Create S3 client instance
export const s3Client = new S3Client({
  credentials: s3Config.credentials,
  region: s3Config.region,
});

// CORS configuration
export const corsConfig = {
  origin:
    process.env.OSAKAARTIFACT25_CMS_CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
};

// File upload configuration
export const uploadConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedVideoTypes: ["video/mp4", "video/webm"],
  allowedPdfTypes: ["application/pdf"],
  allowedAudioTypes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"],
};

// API paths configuration
export const apiPaths = {
  upload: "/api/upload",
  artifacts: "/api/artifacts",
} as const;

// Error messages
export const errorMessages = {
  INVALID_FILE_TYPE: "Invalid file type",
  FILE_TOO_LARGE: "File size exceeds limit",
  UPLOAD_FAILED: "File upload failed",
  INVALID_PAYLOAD: "Invalid request payload",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Internal server error",
  DATABASE_ERROR: "Database operation failed",
  S3_ERROR: "S3 operation failed",
} as const;
