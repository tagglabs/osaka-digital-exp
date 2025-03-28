import { z } from "zod";

// 📌 Universal File Schema (For all types of files)
export const fileSchema = z.object({
  originalName: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  extension: z.string(),
  mimeType: z.string(),
  fileURL: z.string(), // S3 or external URL
  uploadDate: z.string(), // ISO timestamp (required to match Mongoose schema)
});

// 📌 Section Schema (Title + Content with Japanese support)
export const sectionSchema = z.object({
  title: z
    .string()
    .nonempty({ message: "Section title is required" }),
  titleJap: z.string().optional(),
  content: z
    .string()
    .nonempty({ message: "Section content is required" }),
  contentJap: z.string().optional(),
});

// 📌 Media Gallery Schema (Unified for images/videos)
export const mediaGallerySchema = z.array(fileSchema);

// 📌 PDF Upload Schema (Supports multiple PDFs)
export const pdfSchema = z.array(fileSchema);

// 📌 Main Artifact Schema
export const artifactSchema = z.object({
  zoneName: z
    .string({
      required_error: "Zone name is required",
      invalid_type_error: "Zone name is required",
    })
    .refine(
      (val) =>
        [
          "zone1",
          "zone2",
          "zone3",
          "zone4",
          "zone5",
          "zone6",
          "zone7",
          "zone8",
          "zone9",
        ].includes(val),
      {
        message: "Zone name is required",
      },
    ),
  artifactName: z
    .string()
    .nonempty({ message: "Artifact name is required !" }),
  artifactNameJap: z.string().optional(),
  description: z
    .string()
    .nonempty({ message: "Description is required !" }),
  descriptionJap: z.string().optional(),
  profilePicture: fileSchema.optional(), // Single profile picture
  sections: z
    .tuple([sectionSchema])
    .rest(sectionSchema)
    .describe("At least one section required"),
  pdfs: pdfSchema, // Multiple PDFs
  audioGuide: fileSchema.optional(), // Single audio guide
  referenceLink: z
    .string()
    .url({ message: "Enter a valid url !" })
    .optional()
    .or(z.literal("")), // External reference link
  referenceLinks: z.array(z.string()),
  mediaGallery: mediaGallerySchema, // Multiple images/videos
  externalURL: z.string().url().optional(), // Optional external reference link
  createdAt: z.string().optional(), // Timestamp (ISO format)
});

// 📌 Type Definitions for TypeScript
export type FormData = z.infer<typeof artifactSchema>;
export type SectionType = z.infer<typeof sectionSchema>;
export type FileType = z.infer<typeof fileSchema>;
