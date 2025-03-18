import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { artifactRoutes } from "./routes/artifact.routes";
import { errorHandler } from "./middleware/error.middleware";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads directory for local storage
const uploadDir = process.env.UPLOAD_DIR || "uploads";
app.use(
  "/" + uploadDir,
  express.static(
    path.join(__dirname, "../../" + uploadDir),
  ),
);

// Routes
app.use("/api/artifacts", artifactRoutes);

// Error handling
app.use(errorHandler);

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI ||
      "mongodb://localhost:27017/artifacts-db",
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });
