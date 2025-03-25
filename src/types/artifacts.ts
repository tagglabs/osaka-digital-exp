import { z } from "zod";

// 📌 Universal File Schema (For all types of files)
export const fileSchema = z.object({
  originalName: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  extension: z.string(),
  mimeType: z.string(),
  fileURL: z.string(), // S3 or external URL
  uploadDate: z.string().optional(), // ISO timestamp
});

// 📌 Section Schema (Title + Content)
export const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
});

// 📌 Media Gallery Schema (Unified for images/videos)
export const mediaGallerySchema = z.array(fileSchema);

// 📌 PDF Upload Schema (Supports multiple PDFs)
export const pdfSchema = z.array(fileSchema);

// 📌 Main Artifact Schema
export const artifactSchema = z.object({
  zoneName: z.string().min(1, "Zone name is required"),
  artifactName: z
    .string()
    .min(1, "Artifact name is required"),
  description: z.string().min(1, "Description is required"),
  profilePicture: fileSchema.optional(), // Single profile picture
  sections: z
    .array(sectionSchema)
    .min(1, "At least one section is required"),
  pdfs: pdfSchema, // Multiple PDFs
  audioGuide: fileSchema.optional(), // Single audio guide
  referenceLinks: z.array(z.string().url()).optional(), // External reference links
  mediaGallery: mediaGallerySchema, // Multiple images/videos
  externalURL: z.string().url().optional(), // Optional external reference link
  createdAt: z.string().optional(), // Timestamp (ISO format)
});

// 📌 Type Definitions for TypeScript
export type FormData = z.infer<typeof artifactSchema>;
export type SectionType = z.infer<typeof sectionSchema>;
export type FileType = z.infer<typeof fileSchema>;
