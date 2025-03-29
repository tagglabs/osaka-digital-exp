import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { serverConfig, corsConfig, mongoConfig, errorMessages } from "./config";
import artifactRoutes from "./routes/artifact.routes";
import adminRoutes from "./routes/admin.routes";

const app = express();

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", artifactRoutes);
app.use("/api/admin", adminRoutes);

app.post("/api/test", (req, res) => {
  console.log("Received test request:", req.body);
  res.status(200).json({ message: "Test successful" });
});

app.post("/api/test2", (req, res) => {
  res.status(200).json({ message: "Test2 successful" });
});
// Custom error type
interface AppError extends Error {
  status?: number;
}

// Error handling middleware
app.use((err: AppError, req: express.Request, res: express.Response) => {
  console.error("Error:", {
    name: err.name,
    message: err.message,
    stack: serverConfig.nodeEnv === "development" ? err.stack : undefined,
  });

  const statusCode = err.status || 500;
  const message =
    statusCode === 500
      ? serverConfig.nodeEnv === "production"
        ? errorMessages.SERVER_ERROR
        : err.message
      : err.message;

  res.status(statusCode).json({
    error: {
      message,
      ...(serverConfig.nodeEnv === "development" && {
        stack: err.stack,
      }),
    },
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: errorMessages.NOT_FOUND });
});

// Connect to MongoDB
const startServer = async () => {
  try {
    await mongoose.connect(mongoConfig.uri);
    console.log("Connected to MongoDB");

    app.listen(serverConfig.port, () => {
      console.log(
        `Server running in ${serverConfig.nodeEnv} mode on port ${serverConfig.port}`,
      );
      console.log(`Base URL: ${serverConfig.baseUrl}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on("uncaughtException", (error: Error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});

// Start server
startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});

export default app;
