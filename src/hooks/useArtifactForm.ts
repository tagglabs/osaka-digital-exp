import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  artifactSchema,
  FormData,
  SectionType,
} from "../types/artifacts";
import { useUploadManager } from "./useUploadManager";

export const useArtifactForm = () => {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [sections, setSections] = useState<SectionType[]>([
    { title: "Overview", content: "" },
  ]);
  const [referenceLinks, setReferenceLinks] = useState<
    string[]
  >([]);

  // Initialize upload manager and form
  const uploadManager = useUploadManager();
  const uploadedFiles = uploadManager.getSelectedFiles();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    clearErrors,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      zoneName: undefined,
      artifactName: "",
      description: "",
      sections: [{ title: "Overview", content: "" }],
      pdfs: [],
      mediaGallery: [],
      audioGuide: undefined,
      referenceLinks: [],
    },
  });

  // Keep form sections in sync with local state
  useEffect(() => {
    setValue("sections", sections);
  }, [sections, setValue]);

  // File handlers
  const handleProfilePicture = (files: File[]) => {
    if (files.length > 0) {
      uploadManager.addFile("profile", [files[0]]);
    }
  };

  const handleAudioUpload = (files: File[]) => {
    if (files.length > 0) {
      uploadManager.addFile("audio", [files[0]]);
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
        ? uploadedFiles.media.images
        : uploadedFiles.media.videos;
    const fileToDelete = files[index];
    if (fileToDelete) {
      uploadManager.removeFile(type, fileToDelete.name);
    }
  };

  const handlePdfDelete = (index: number) => {
    const pdfs = uploadedFiles.pdfs;
    const pdfToDelete = pdfs[index];
    if (pdfToDelete) {
      uploadManager.removeFile("pdf", pdfToDelete.name);
    }
  };

  // Reference Links handlers
  const addReferenceLink = (url: string) => {
    if (!url.trim()) return;
    try {
      new URL(url); // Validate URL
      setReferenceLinks((prev) => [...prev, url]);
      setValue("referenceLinks", [...referenceLinks, url]);
    } catch (e) {
      console.error("Invalid URL:", e);
      setError("referenceLinks", {
        type: "manual",
        message: "Please enter a valid URL",
      });
    }
  };

  const deleteReferenceLink = (index: number) => {
    setReferenceLinks((prev) =>
      prev.filter((_, i) => i !== index),
    );
    setValue(
      "referenceLinks",
      referenceLinks.filter((_, i) => i !== index),
    );
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

  // Form submission handler
  const onSubmit = async (data: FormData) => {
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

      // Skip initial Zod validation as it will fail without uploaded files
      console.log("Proceeding with file upload...");

      // Upload all files and get their details
      const uploadResult = await uploadManager.uploadAll();
      console.log("Upload result:", uploadResult);

      // Prepare submission data
      const submissionData: FormData = {
        zoneName: data.zoneName,
        artifactName: data.artifactName.trim(),
        description: data.description.trim(),
        sections: sections.map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
        })),
        pdfs: uploadResult.pdfs.map((file) => ({
          ...file,
          uploadDate: new Date().toISOString(),
        })),
        mediaGallery: [
          ...uploadResult.mediaGallery.images.map(
            (file) => ({
              ...file,
              uploadDate: new Date().toISOString(),
            }),
          ),
          ...uploadResult.mediaGallery.videos.map(
            (file) => ({
              ...file,
              uploadDate: new Date().toISOString(),
            }),
          ),
        ],
        profilePicture: uploadResult.profilePicture
          ? {
              ...uploadResult.profilePicture,
              uploadDate: new Date().toISOString(),
            }
          : undefined,
        audioGuide: uploadResult.audioGuide
          ? {
              ...uploadResult.audioGuide,
              uploadDate: new Date().toISOString(),
            }
          : undefined,
        referenceLinks: referenceLinks,
      };

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
        submissionData,
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
    profilePreview: uploadedFiles.profilePicture
      ? URL.createObjectURL(uploadedFiles.profilePicture)
      : null,
    profileFile: uploadedFiles.profilePicture,
    audioPreview: uploadedFiles.audioGuide
      ? URL.createObjectURL(uploadedFiles.audioGuide)
      : null,
    audioFile: uploadedFiles.audioGuide,
    pdfs: uploadedFiles.pdfs,
    mediaFiles: uploadedFiles.media,

    // File handlers
    handleProfilePicture,
    handleAudioUpload,
    handlePdfUpload,
    handlePdfDelete,
    handleMediaUpload,
    handleMediaDelete,

    // Reference Links management
    referenceLinks,
    addReferenceLink,
    deleteReferenceLink,
  };
};
