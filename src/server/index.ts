import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { artifactRoutes } from "./routes/artifact.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import type { Server } from "http";

// Load environment variables
dotenv.config();

const app = express();
const basePort = process.env.PORT
  ? parseInt(process.env.PORT)
  : 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory for local storage
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use(
  "/" + uploadDir,
  express.static(path.join(process.cwd(), uploadDir)),
);

// Routes
app.use("/api/artifacts", artifactRoutes);

// Error handling
app.use(errorHandler);

// Define NodeJS.ErrnoException type for server errors
interface ServerError extends NodeJS.ErrnoException {
  code?: string;
  port?: number;
}

// Try different ports if the default one is taken
const startServer = async (port: number) => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/artifacts-db",
    );
    console.log("Connected to MongoDB");

    const server: Server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on("error", (err: ServerError) => {
      if (err.code === "EADDRINUSE") {
        console.log(
          `Port ${port} is busy, trying ${port + 1}...`,
        );
        startServer(port + 1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
startServer(basePort);
