import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import {
  artifactSchema,
  FormData,
  SectionType,
} from "../types/artifacts";
import { useUploadManager } from "./useUploadManager";

interface ArtifactResponse {
  id: string;
  artifactName: string;
  description: string;
  zoneName: string;
  sections: SectionType[];
  pdfs: any[];
  mediaGallery: any[];
  profilePicture?: {
    originalName: string;
    fileName: string;
    fileSize: number;
    extension: string;
  };
  referenceLinks: string[];
  createdAt: string;
  updatedAt: string;
}

interface ArtifactInfo {
  id: string;
  artifactName: string;
}

export const useArtifactForm = () => {
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [language, setLanguage] = useState<"en" | "jp">(
    "en",
  );
  const [sections, setSections] = useState<SectionType[]>([
    {
      title: "Overview",
      titleJap: "概要",
      content: "",
      contentJap: "",
    },
  ]);
  const [referenceLinks, setReferenceLinks] = useState<
    string[]
  >([]);

  // Reference link handlers
  const addReferenceLink = (url: string) => {
    try {
      // Validate URL using the schema
      const result =
        artifactSchema.shape.referenceLink.safeParse(url);
      if (!result.success) {
        toast.error("Please enter a valid URL");
        return;
      }
      setReferenceLinks([...referenceLinks, url]);
      setValue("referenceLinks", [...referenceLinks, url]);
    } catch (error) {
      toast.error("Failed to add reference link");
    }
  };

  const deleteReferenceLink = (index: number) => {
    const newLinks = referenceLinks.filter(
      (_, i) => i !== index,
    );
    setReferenceLinks(newLinks);
    setValue("referenceLinks", newLinks);
  };

  // QR Code Modal state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [artifactCreated, setArtifactCreated] =
    useState(false);
  const [artifact, setArtifact] =
    useState<ArtifactInfo | null>(null);

  // Initialize upload manager and form
  const uploadManager = useUploadManager();
  const uploadedFiles = uploadManager.getSelectedFiles();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      zoneName: undefined,
      artifactName: "",
      artifactNameJap: "",
      description: "",
      descriptionJap: "",
      sections: [
        {
          title: "Overview",
          titleJap: "概要",
          content: "",
          contentJap: "",
        },
      ],
      pdfs: [],
      mediaGallery: [],
      audioGuide: undefined,
      referenceLinks: [],
      referenceLink: "",
    },
  });

  // Keep form sections in sync with local state
  useEffect(() => {
    // Ensure sections array always has at least one element in the correct tuple format
    setValue("sections", [
      sections[0] || { title: "Overview", content: "" },
      ...sections.slice(1),
    ]);
  }, [sections, setValue]);

  // QR Code handlers
  const handleDownloadQR = () => {
    if (!artifact) return;

    const svg = document.getElementById("qr-code");
    const svgData = new XMLSerializer().serializeToString(
      svg!,
    );
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.fillStyle = "white";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${artifact.artifactName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

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

  // Section handlers
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "jp" : "en"));
  };

  const addNewSection = () => {
    const newSections = [
      ...sections,
      {
        title: "Untitled",
        titleJap: "無題",
        content: "",
        contentJap: "",
      },
    ];
    setSections(newSections);
    setActiveSection(newSections.length - 1);
  };

  const handleSectionChange = (
    index: number,
    title: string,
    content: string,
    titleJap?: string,
    contentJap?: string,
  ) => {
    const newSections = [...sections];
    newSections[index] = {
      ...newSections[index],
      title,
      content,
      ...(titleJap && { titleJap }),
      ...(contentJap && { contentJap }),
    };
    setSections(newSections);
    setActiveSection(index);
    // Ensure it matches the tuple schema [first, ...rest]
    setValue("sections", [
      sections[0] || {
        title: "Overview",
        titleJap: "概要",
        content: "",
        contentJap: "",
      },
      ...sections.slice(1),
    ]);
  };

  const deleteSection = (index: number) => {
    // Cannot delete the Overview section (index 0)
    if (index === 0) return;
    
    // Remove the section
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    
    // Update active section if needed
    if (activeSection >= index) {
      setActiveSection(Math.max(0, activeSection - 1));
    }
    
    // Update form value
    setValue("sections", [
      newSections[0] || {
        title: "Overview",
        titleJap: "概要",
        content: "",
        contentJap: "",
      },
      ...newSections.slice(1),
    ]);
  };

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    console.log("Submitting form data:", data);
    setIsSubmitting(true);

    try {
      // Check if profile picture is uploaded
      if (!uploadedFiles.profilePicture) {
        toast.error("Profile picture is required");
        setIsSubmitting(false);
        return;
      }

      // Upload all files and get their details
      const uploadResult = await uploadManager.uploadAll();
      console.log("Upload result:", uploadResult);

      // Prepare submission data
      const submissionData: FormData = {
        zoneName: data.zoneName,
        artifactName: data.artifactName.trim(),
        artifactNameJap: data.artifactNameJap?.trim() || "",
        description: data.description.trim(),
        descriptionJap: data.descriptionJap?.trim() || "",
        sections: [
          // Ensure at least one section exists
          {
            title: sections[0]?.title.trim() || "Overview",
            titleJap:
              sections[0]?.titleJap?.trim() || "概要",
            content: sections[0]?.content.trim() || "",
            contentJap:
              sections[0]?.contentJap?.trim() || "",
          },
          // Add remaining sections
          ...sections.slice(1).map((section) => ({
            title: section.title.trim(),
            titleJap: section.titleJap?.trim() || "",
            content: section.content.trim(),
            contentJap: section.contentJap?.trim() || "",
          })),
        ],
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
        toast.error(
          finalValidation.error.errors[0]?.message ||
            "Invalid form data structure",
        );
        setIsSubmitting(false);
        return;
      }

      // Submit to artifacts API
      const response = await axios.post<ArtifactResponse>(
        `${import.meta.env.VITE_BACKEND_URL}/api/artifacts`,
        submissionData,
      );

      // Store artifact info from response
      setArtifact({
        id: response.data.id,
        artifactName: response.data.artifactName,
      });
      setArtifactCreated(true);

      // Reset form state
      reset();
      setSections([
        {
          title: "Overview",
          titleJap: "概要",
          content: "",
          contentJap: "",
        },
      ]);
      uploadManager.reset();
      setActiveSection(0);

      toast.success("Artifact created successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "Failed to create artifact",
      );
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

    // Language control
    language,
    toggleLanguage,

    // Section management
    sections,
    activeSection,
    addNewSection,
    handleSectionChange,
    deleteSection,

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

    // Reference link management
    referenceLinks,
    addReferenceLink,
    deleteReferenceLink,

    // QR Code management
    isQRModalOpen,
    setIsQRModalOpen,
    handleDownloadQR,
    artifactCreated,
    artifact,
  };
};
