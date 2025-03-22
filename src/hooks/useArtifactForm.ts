import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  artifactSchema,
  FormData,
  SectionType,
  FileType,
} from "../types/artifacts";
import { useUploadManager } from "./useUploadManager";
import { FileWithPreview } from "../types/uploadManager";

export const useArtifactForm = () => {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [sections, setSections] = useState<SectionType[]>([
    { title: "Overview", content: "" },
  ]);

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      zoneName: "",
      artifactName: "",
      description: "",
      sections: [{ title: "Overview", content: "" }],
      pdfs: [],
      mediaGallery: [],
    },
  });

  // Debug: Watch form values
  const formValues = watch();
  console.log("Current form values:", formValues);
  console.log("Current form errors:", errors);

  // Keep form sections in sync with local state
  useEffect(() => {
    setValue("sections", sections);
  }, [sections, setValue]);

  // Initialize upload manager
  const uploadManager = useUploadManager();

  // File handlers
  const handleProfilePicture = (files: File[]) => {
    if (files.length > 0) {
      uploadManager.addFile("profile", [files[0]]);
    }
  };

  const handlePdfUpload = (files: File[]) => {
    uploadManager.addFile("pdf", files);
  };

  const handleMediaUpload =
    (type: "image" | "video") => (files: File[]) => {
      uploadManager.addFile(type, files);
    };

  // Delete handlers
  const handleMediaDelete = (
    index: number,
    type: "image" | "video",
  ) => {
    const files =
      type === "image"
        ? uploadManager.getFiles().mediaFiles.images
        : uploadManager.getFiles().mediaFiles.videos;
    const fileToDelete = files[index];
    if (fileToDelete) {
      uploadManager.removeFile(type, fileToDelete.fileName);
    }
  };

  const handlePdfDelete = (index: number) => {
    const pdfs = uploadManager.getFiles().pdfs;
    const pdfToDelete = pdfs[index];
    if (pdfToDelete) {
      uploadManager.removeFile("pdf", pdfToDelete.fileName);
    }
  };

  // Section handlers
  const addNewSection = () => {
    const newSections = [
      ...sections,
      { title: "Untitled", content: "" },
    ];
    setSections(newSections);
    setActiveSection(newSections.length - 1);
  };

  const handleSectionChange = (
    index: number,
    title: string,
    content: string,
  ) => {
    const newSections = [...sections];
    newSections[index] = { title, content };
    setSections(newSections);
    setActiveSection(index);

    // Validate section content
    if (!title || !content) {
      setError(`sections.${index}`, {
        type: "manual",
        message: "Both title and content are required",
      });
    } else {
      clearErrors(`sections.${index}`);
    }
  };

  // Convert FileWithPreview to FileType
  const convertToFileType = (
    file: FileWithPreview,
  ): FileType => ({
    originalName: file.originalName,
    fileName: file.fileName,
    fileSize: file.fileSize,
    extension: file.extension,
    mimeType: file.mimeType,
    fileURL: file.fileURL,
    uploadDate: new Date().toISOString(),
  });

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    console.log("Form submission started");
    console.log("Received form data:", data);

    setIsSubmitting(true);
    clearErrors();

    try {
      // Validate required fields
      if (!data.zoneName?.trim()) {
        setError("zoneName", {
          message: "Zone name is required",
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.artifactName?.trim()) {
        setError("artifactName", {
          message: "Artifact name is required",
        });
        setIsSubmitting(false);
        return;
      }

      if (!data.description?.trim()) {
        setError("description", {
          message: "Description is required",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate sections
      if (!sections.length) {
        setError("sections", {
          message: "At least one section is required",
        });
        setIsSubmitting(false);
        return;
      }

      for (let i = 0; i < sections.length; i++) {
        if (
          !sections[i].title.trim() ||
          !sections[i].content.trim()
        ) {
          setError(`sections.${i}`, {
            message: "Both title and content are required",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Debug validation
      const validationResult =
        artifactSchema.safeParse(data);
      if (!validationResult.success) {
        console.error(
          "Zod validation failed:",
          validationResult.error,
        );
        setError("root", {
          message:
            "Form validation failed. Check all required fields.",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("Zod validation passed");

      const uploadStatus = uploadManager.getStatus();
      console.log("Upload status:", uploadStatus);

      // Check if any files are still uploading
      if (uploadStatus.isUploading) {
        setError("root", {
          message:
            "Please wait for all file uploads to complete",
        });
        setIsSubmitting(false);
        return;
      }

      // Check for upload errors
      if (uploadStatus.hasErrors) {
        setError("root", {
          message:
            "Please fix upload errors before submitting",
        });
        setIsSubmitting(false);
        return;
      }

      // Upload any remaining files
      await uploadManager.uploadAll();

      // Get all uploaded files
      const uploadedFiles = uploadManager.getFiles();
      console.log("Uploaded files:", uploadedFiles);

      // Prepare submission data
      const submissionData: FormData = {
        zoneName: data.zoneName.trim(),
        artifactName: data.artifactName.trim(),
        description: data.description.trim(),
        sections: sections.map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
        })),
        pdfs: uploadedFiles.pdfs.map(convertToFileType),
        mediaGallery: [
          ...uploadedFiles.mediaFiles.images.map(
            convertToFileType,
          ),
          ...uploadedFiles.mediaFiles.videos.map(
            convertToFileType,
          ),
        ],
        profilePicture: uploadedFiles.profilePicture
          ? convertToFileType(uploadedFiles.profilePicture)
          : undefined,
      };

      console.log("Final submission data:", submissionData);

      // Validate submission data
      const finalValidation =
        artifactSchema.safeParse(submissionData);
      if (!finalValidation.success) {
        console.error(
          "Final validation failed:",
          finalValidation.error,
        );
        setError("root", {
          message: "Invalid form data structure",
        });
        setIsSubmitting(false);
        return;
      }

      console.log(
        "Final validation passed, submitting to API",
      );

      // Submit to artifacts API
      await axios.post("/api/artifacts", submissionData);

      console.log("API submission successful");

      // Reset form state
      reset();
      setSections([{ title: "Overview", content: "" }]);
      uploadManager.reset();
      setActiveSection(0);

      alert("Artifact created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("root", {
        message: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Failed to create artifact",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const files = uploadManager.getFiles();
  const uploadStatus = uploadManager.getStatus();

  return {
    // Form state
    register,
    errors,
    isSubmitting,
    handleSubmit: handleSubmit(onSubmit),

    // Section management
    sections,
    activeSection,
    addNewSection,
    handleSectionChange,

    // File management
    profilePreview: files.profilePicture?.preview || null,
    profileFile: files.profilePicture,
    pdfs: files.pdfs,
    mediaFiles: files.mediaFiles,
    uploadStatus,

    // File handlers
    handleProfilePicture,
    handlePdfUpload,
    handlePdfDelete,
    handleMediaUpload,
    handleMediaDelete,
  };
};
