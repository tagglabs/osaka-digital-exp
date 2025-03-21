import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  artifactSchema,
  FileType,
  SectionType,
} from "../types/artifacts";

import type { FormData } from "../types/artifacts";

interface FileWithPreview extends FileType {
  file: File;
  preview: string;
  progress: number;
  error?: string;
  uploaded?: boolean;
}

interface MediaState {
  images: FileWithPreview[];
  videos: FileWithPreview[];
}

export const useArtifactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [profilePreview, setProfilePreview] = useState<
    string | null
  >(null);
  const [profileFile, setProfileFile] =
    useState<FileWithPreview | null>(null);
  const [sections, setSections] = useState<SectionType[]>([
    { title: "Overview", content: "" },
  ]);
  const [pdfs, setPdfs] = useState<FileWithPreview[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaState>({
    images: [],
    videos: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    setError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      sections: [{ title: "Overview", content: "" }],
      pdfs: [],
      mediaGallery: [],
    },
  });

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
      mediaFiles.images.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
      mediaFiles.videos.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
      pdfs.forEach((item) => {
        URL.revokeObjectURL(item.preview);
      });
    };
  }, [mediaFiles, pdfs, profilePreview]);

  // Upload file to server and get S3 URL
  const uploadFile = async (
    file: File,
    type: string,
    fileId: string,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await axios.post(
        "/api/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress =
              (progressEvent.loaded /
                (progressEvent.total || 0)) *
              100;

            // Update progress based on file type
            if (
              type === "profile" &&
              profileFile?.file === file
            ) {
              setProfileFile((prev) =>
                prev
                  ? { ...prev, progress, error: undefined }
                  : null,
              );
            } else if (type === "pdf") {
              setPdfs((prev) =>
                prev.map((item) =>
                  item.file === file
                    ? {
                        ...item,
                        progress,
                        error: undefined,
                      }
                    : item,
                ),
              );
            } else if (type === "image") {
              setMediaFiles((prev) => ({
                ...prev,
                images: prev.images.map((item) =>
                  item.file === file
                    ? {
                        ...item,
                        progress,
                        error: undefined,
                      }
                    : item,
                ),
              }));
            } else if (type === "video") {
              setMediaFiles((prev) => ({
                ...prev,
                videos: prev.videos.map((item) =>
                  item.file === file
                    ? {
                        ...item,
                        progress,
                        error: undefined,
                      }
                    : item,
                ),
              }));
            }
          },
        },
      );

      // Mark file as uploaded with its URL
      if (
        type === "profile" &&
        profileFile?.file === file
      ) {
        setProfileFile((prev) =>
          prev
            ? {
                ...prev,
                fileURL: response.data.fileURL,
                uploaded: true,
              }
            : null,
        );
      } else if (type === "pdf") {
        setPdfs((prev) =>
          prev.map((item) =>
            item.file === file
              ? {
                  ...item,
                  fileURL: response.data.fileURL,
                  uploaded: true,
                }
              : item,
          ),
        );
      } else if (type === "image") {
        setMediaFiles((prev) => ({
          ...prev,
          images: prev.images.map((item) =>
            item.file === file
              ? {
                  ...item,
                  fileURL: response.data.fileURL,
                  uploaded: true,
                }
              : item,
          ),
        }));
      } else if (type === "video") {
        setMediaFiles((prev) => ({
          ...prev,
          videos: prev.videos.map((item) =>
            item.file === file
              ? {
                  ...item,
                  fileURL: response.data.fileURL,
                  uploaded: true,
                }
              : item,
          ),
        }));
      }

      return response.data.fileURL;
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Upload failed";

      if (
        type === "profile" &&
        profileFile?.file === file
      ) {
        setProfileFile((prev) =>
          prev
            ? { ...prev, progress: 0, error: errorMessage }
            : null,
        );
      } else if (type === "pdf") {
        setPdfs((prev) =>
          prev.map((item) =>
            item.file === file
              ? {
                  ...item,
                  progress: 0,
                  error: errorMessage,
                }
              : item,
          ),
        );
      } else if (type === "image") {
        setMediaFiles((prev) => ({
          ...prev,
          images: prev.images.map((item) =>
            item.file === file
              ? {
                  ...item,
                  progress: 0,
                  error: errorMessage,
                }
              : item,
          ),
        }));
      } else if (type === "video") {
        setMediaFiles((prev) => ({
          ...prev,
          videos: prev.videos.map((item) =>
            item.file === file
              ? {
                  ...item,
                  progress: 0,
                  error: errorMessage,
                }
              : item,
          ),
        }));
      }

      throw new Error(errorMessage);
    }
  };

  // Prepare data by collecting uploaded files and their URLs
  const prepareSubmissionData = (): FormData => {
    // Set sections data
    setValue("sections", sections);

    // Set profile picture data if uploaded
    if (profileFile?.uploaded && profileFile?.fileURL) {
      setValue("profilePicture", {
        originalName: profileFile.file.name,
        fileName: profileFile.file.name,
        fileSize: profileFile.file.size,
        extension:
          profileFile.file.name.split(".").pop() || "",
        mimeType: profileFile.file.type,
        fileURL: profileFile.fileURL,
      });
    }

    // Set PDF file data
    const uploadedPdfs = pdfs
      .filter((pdf) => pdf.uploaded && pdf.fileURL)
      .map((pdf) => ({
        originalName: pdf.file.name,
        fileName: pdf.file.name,
        fileSize: pdf.file.size,
        extension: pdf.file.name.split(".").pop() || "",
        mimeType: pdf.file.type,
        fileURL: pdf.fileURL,
      }));
    setValue("pdfs", uploadedPdfs);

    // Set media gallery data
    const uploadedMedia = [
      ...mediaFiles.images
        .filter((img) => img.uploaded && img.fileURL)
        .map((img) => ({
          originalName: img.file.name,
          fileName: img.file.name,
          fileSize: img.file.size,
          extension: img.file.name.split(".").pop() || "",
          mimeType: img.file.type,
          fileURL: img.fileURL,
        })),
      ...mediaFiles.videos
        .filter((vid) => vid.uploaded && vid.fileURL)
        .map((vid) => ({
          originalName: vid.file.name,
          fileName: vid.file.name,
          fileSize: vid.file.size,
          extension: vid.file.name.split(".").pop() || "",
          mimeType: vid.file.type,
          fileURL: vid.fileURL,
        })),
    ];
    setValue("mediaGallery", uploadedMedia);

    // Return the latest form values
    return {
      zoneName: "",
      artifactName: "",
      description: "",
      sections: sections,
      pdfs: uploadedPdfs,
      mediaGallery: uploadedMedia,
      profilePicture:
        profileFile?.uploaded && profileFile.fileURL
          ? {
              originalName: profileFile.file.name,
              fileName: profileFile.file.name,
              fileSize: profileFile.file.size,
              extension:
                profileFile.file.name.split(".").pop() ||
                "",
              mimeType: profileFile.file.type,
              fileURL: profileFile.fileURL,
            }
          : undefined,
    };
  };

  // Upload a single file
  const uploadSingleFile = async (
    file: FileWithPreview,
    fileType: "profile" | "pdf" | "image" | "video",
  ) => {
    if (file.uploaded || file.error) return;

    try {
      await uploadFile(
        file.file,
        fileType === "profile"
          ? "profile"
          : fileType === "pdf"
          ? "pdf"
          : fileType,
        Date.now().toString(),
      );
    } catch (error) {
      console.error(
        `Error uploading ${fileType} file:`,
        error,
      );
    }
  };

  // Upload files immediately when they're added
  useEffect(() => {
    if (
      profileFile &&
      !profileFile.uploaded &&
      !profileFile.error &&
      profileFile.progress === 0
    ) {
      uploadSingleFile(profileFile, "image");
    }
  }, [profileFile]);

  useEffect(() => {
    pdfs.forEach((pdf) => {
      if (
        !pdf.uploaded &&
        !pdf.error &&
        pdf.progress === 0
      ) {
        uploadSingleFile(pdf, "pdf");
      }
    });
  }, [pdfs]);

  useEffect(() => {
    mediaFiles.images.forEach((image) => {
      if (
        !image.uploaded &&
        !image.error &&
        image.progress === 0
      ) {
        uploadSingleFile(image, "image");
      }
    });

    mediaFiles.videos.forEach((video) => {
      if (
        !video.uploaded &&
        !video.error &&
        video.progress === 0
      ) {
        uploadSingleFile(video, "video");
      }
    });
  }, [mediaFiles]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      // Check if any files are still uploading
      const isUploading =
        (profileFile &&
          profileFile.progress > 0 &&
          profileFile.progress < 100) ||
        pdfs.some(
          (pdf) => pdf.progress > 0 && pdf.progress < 100,
        ) ||
        mediaFiles.images.some(
          (img) => img.progress > 0 && img.progress < 100,
        ) ||
        mediaFiles.videos.some(
          (vid) => vid.progress > 0 && vid.progress < 100,
        );

      if (isUploading) {
        setError("root", {
          message:
            "Please wait for all file uploads to complete",
        });
        setIsSubmitting(false);
        return;
      }

      // Check for upload errors
      const hasErrors =
        (profileFile && profileFile.error) ||
        pdfs.some((pdf) => pdf.error) ||
        mediaFiles.images.some((img) => img.error) ||
        mediaFiles.videos.some((vid) => vid.error);

      if (hasErrors) {
        setError("root", {
          message:
            "Please fix upload errors before submitting",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare data with uploaded files
      const preparedData = prepareSubmissionData();

      // Submit to artifacts API
      await axios.post("/api/artifacts", preparedData);

      // Reset form on success
      reset();
      setProfileFile(null);
      setProfilePreview(null);
      setSections([{ title: "Overview", content: "" }]);
      setPdfs([]);
      setMediaFiles({ images: [], videos: [] });

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

  const createFileWithPreview = (
    file: File,
  ): FileWithPreview => ({
    file,
    preview: URL.createObjectURL(file),
    progress: 0,
    originalName: file.name,
    fileName: file.name,
    fileSize: file.size,
    extension: file.name.split(".").pop() || "",
    mimeType: file.type,
    fileURL: "",
  });

  // File handlers
  const handleProfilePicture = (files: File[]) => {
    if (files.length > 0) {
      if (profilePreview)
        URL.revokeObjectURL(profilePreview);
      const preview = URL.createObjectURL(files[0]);
      setProfilePreview(preview);
      setProfileFile(createFileWithPreview(files[0]));
    }
  };

  const handlePdfUpload = (files: File[]) => {
    const pdfFiles = files.map(createFileWithPreview);
    setPdfs((prev) => [...prev, ...pdfFiles]);
  };

  const handleMediaUpload =
    (type: "image" | "video") => (files: File[]) => {
      const mediaFiles = files.map(createFileWithPreview);
      setMediaFiles((prev) => ({
        ...prev,
        [type === "image" ? "images" : "videos"]: [
          ...prev[type === "image" ? "images" : "videos"],
          ...mediaFiles,
        ],
      }));
    };

  // Delete handlers
  const handleMediaDelete = (
    index: number,
    type: "image" | "video",
  ) => {
    setMediaFiles((prev) => {
      const newMediaFiles = { ...prev };
      const fileList =
        type === "image"
          ? newMediaFiles.images
          : newMediaFiles.videos;
      URL.revokeObjectURL(fileList[index].preview);
      if (type === "image") {
        newMediaFiles.images.splice(index, 1);
      } else {
        newMediaFiles.videos.splice(index, 1);
      }
      return newMediaFiles;
    });
  };

  const handlePdfDelete = (index: number) => {
    setPdfs((prev) => {
      const newPdfs = [...prev];
      URL.revokeObjectURL(newPdfs[index].preview);
      newPdfs.splice(index, 1);
      return newPdfs;
    });
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
  };

  return {
    register,
    errors,
    isSubmitting,
    handleSubmit: handleSubmit(onSubmit),
    sections,
    activeSection,
    addNewSection,
    handleSectionChange,
    profilePreview,
    profileFile,
    handleProfilePicture,
    pdfs,
    handlePdfUpload,
    handlePdfDelete,
    mediaFiles,
    handleMediaUpload,
    handleMediaDelete,
  };
};
