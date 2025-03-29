import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "../Components/Button";
import { Input } from "../Components/Input";
import { Section } from "../Components/Section";
import { UploadPreview } from "../Components/UploadPreview";
import { useUploadManager } from "../hooks/useUploadManager";
import ArtifactDetails from "../Components/ArtifactDetails";
import DocumentUploads from "../Components/DocumentUploads";
import MediaGallery from "../Components/MediaGallery";
import AudioUpload from "../Components/AudioUpload";
import {
  FormData,
  artifactSchema,
} from "../types/artifacts";
import {
  FileDetails,
  MediaGallery as MediaGalleryType,
} from "../types/uploadManager";

function EditCms() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] =
    useState<FileDetails | null>(null);
  const [existingPdfs, setExistingPdfs] = useState<
    FileDetails[]
  >([]);
  const [existingAudio, setExistingAudio] =
    useState<FileDetails | null>(null);
  const [existingMedia, setExistingMedia] =
    useState<MediaGalleryType>({
      images: [],
      videos: [],
    });
  const [activeSection, setActiveSection] = useState(0);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const handleAddLink = (
    input: HTMLInputElement | null,
  ) => {
    if (!input?.value) return;

    // Use schema validation for URL
    const result =
      artifactSchema.shape.referenceLink.safeParse(
        input.value,
      );
    if (result.success) {
      const currentLinks =
        form.getValues().referenceLinks || [];
      form.setValue(
        "referenceLinks",
        [...currentLinks, input.value],
        { shouldValidate: true },
      );
      input.value = ""; // Clear input after successful add
      form.clearErrors("referenceLinks");
    } else {
      form.setError("referenceLinks", {
        type: "manual",
        message: "Enter a valid url !", // Match schema error message
      });
    }
  };

  // Form initialization with default values
  const form = useForm<FormData>({
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
    mode: "onChange", // Enable validation on change
  });

  const uploadManager = useUploadManager();
  const uploadedFiles = uploadManager.getSelectedFiles();

  const handleProfilePicture = (files: File[]) => {
    if (files.length > 0) {
      uploadManager.addFile("profile", [files[0]]);
      setExistingProfile(null); // Clear existing when new one is uploaded
    }
  };

  const handlePdfUpload = (files: File[]) => {
    uploadManager.addFile("pdf", files);
  };

  const handleMediaUpload =
    (type: "image" | "video") => (files: File[]) => {
      uploadManager.addFile(type, files);
      form.clearErrors("mediaGallery");
    };

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

  const handleAudioUpload = (files: File[]) => {
    if (files.length > 0) {
      uploadManager.addFile("audio", [files[0]]);
      setExistingAudio(null); // Clear existing when new one is uploaded
    }
  };

  const handleSectionChange = (
    index: number,
    title: string,
    content: string,
  ) => {
    setActiveSection(index);
    const updatedSections = [...form.getValues().sections];
    updatedSections[index] = {
      title: title.trim(),
      content: content.trim(),
      titleJap: updatedSections[index]?.titleJap,
      contentJap: updatedSections[index]?.contentJap,
    };

    // Ensure we have the correct tuple structure [first, ...rest]
    const firstSection = updatedSections[0] || {
      title: "Overview",
      content: "",
      titleJap: undefined,
      contentJap: undefined,
    };
    const restSections = updatedSections.slice(1);

    form.setValue(
      "sections",
      [firstSection, ...restSections],
      { shouldValidate: true },
    );
  };

  const addNewSection = () => {
    const currentSections = form.getValues().sections;
    const firstSection = currentSections[0] || {
      title: "Overview",
      content: "",
      titleJap: undefined,
      contentJap: undefined,
    };
    const newSection = {
      title: "Untitled",
      content: "",
      titleJap: undefined,
      contentJap: undefined,
    };

    form.setValue(
      "sections",
      [
        firstSection,
        ...currentSections.slice(1),
        newSection,
      ],
      { shouldValidate: true },
    );
    setActiveSection(currentSections.length);
  };

  // Fetch artifact details
  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await axios.get(
          `/api/artifacts/${id}`,
        );
        const artifact: FormData = response.data;

        // Set form values
        form.reset({
          zoneName: artifact.zoneName,
          artifactName: artifact.artifactName,
          description: artifact.description,
          sections: artifact.sections,
          pdfs: artifact.pdfs || [],
          mediaGallery: artifact.mediaGallery || [],
          profilePicture: artifact.profilePicture,
          referenceLinks: artifact.referenceLinks || [],
        });

        // Reference links are handled by form state

        // Set existing files with previews
        if (artifact.profilePicture) {
          setExistingProfile({
            ...artifact.profilePicture,
            preview: artifact.profilePicture.fileURL,
          } as FileDetails);
        }

        // Set existing PDFs
        if (artifact.pdfs && artifact.pdfs.length > 0) {
          const pdfsWithPreviews = artifact.pdfs.map(
            (pdf) => ({
              ...pdf,
              preview: pdf.fileURL,
            }),
          ) as FileDetails[];
          setExistingPdfs(pdfsWithPreviews);
        }

        if (artifact.mediaGallery) {
          const images: FileDetails[] = [];
          const videos: FileDetails[] = [];

          artifact.mediaGallery.forEach((file) => {
            const fileWithPreview = {
              ...file,
              preview: file.fileURL,
            } as FileDetails;

            if (file.mimeType.startsWith("image/")) {
              images.push(fileWithPreview);
            } else if (file.mimeType.startsWith("video/")) {
              videos.push(fileWithPreview);
            }
          });

          setExistingMedia({ images, videos });
        }

        // Set existing audio file
        if (artifact.audioGuide) {
          setExistingAudio({
            ...artifact.audioGuide,
            preview: artifact.audioGuide.fileURL,
          } as FileDetails);
        }
      } catch (error) {
        toast.error("Error fetching artifact details");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArtifact();
    }
  }, [id, form]);

  const handleFormSubmit = async (formData: FormData) => {
    if (!id) return;
    setIsSubmitting(true);

    try {
      // Validate profile picture is present
      if (
        !uploadedFiles.profilePicture &&
        !existingProfile
      ) {
        form.setError("profilePicture", {
          type: "manual",
          message: "Profile picture is required",
        });
        setIsSubmitting(false);
        return;
      }

      // First upload all new files
      const uploadResult = await uploadManager.uploadAll();

      // Prepare submission data
      const timestamp = new Date().toISOString();
      const updateData = {
        ...formData,
        sections: formData.sections.map((section) => ({
          title: section.title.trim(),
          content: section.content.trim(),
          titleJap: section.titleJap?.trim(),
          contentJap: section.contentJap?.trim(),
        })),
        pdfs: [
          ...existingPdfs,
          ...uploadResult.pdfs.map((file) => ({
            ...file,
            uploadDate: timestamp,
          })),
        ],
        mediaGallery: [
          ...existingMedia.images,
          ...existingMedia.videos,
          ...uploadResult.mediaGallery.images.map(
            (file) => ({
              ...file,
              uploadDate: timestamp,
            }),
          ),
          ...uploadResult.mediaGallery.videos.map(
            (file) => ({
              ...file,
              uploadDate: timestamp,
            }),
          ),
        ],
        profilePicture: uploadResult.profilePicture
          ? {
              ...uploadResult.profilePicture,
              uploadDate: timestamp,
            }
          : existingProfile,
        audioGuide: uploadResult.audioGuide
          ? {
              ...uploadResult.audioGuide,
              uploadDate: timestamp,
            }
          : existingAudio,
        referenceLinks: formData.referenceLinks,
        artifactNameJap: formData.artifactNameJap?.trim(),
        descriptionJap: formData.descriptionJap?.trim(),
      };

      // Validate final data structure
      const validationResult = artifactSchema.safeParse(updateData);
      if (!validationResult.success) {
        toast.error("Failed to update artifact");
        setIsSubmitting(false);
        return;
      }

      await axios.put(`/api/artifacts/${id}`, updateData);
      uploadManager.reset();
      toast.success("Artifact updated successfully!");
    } catch (error) {
      console.error("Error updating artifact:", error);
      toast.error(
        "Unable to update artifact. Please try again",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Convert FileDetails to File objects for DocumentUploads
  const existingPdfFiles = existingPdfs.map(
    (pdf: FileDetails) => {
      return new File(
        [new Blob([], { type: pdf.mimeType })],
        pdf.originalName,
        { type: pdf.mimeType },
      );
    },
  );

  return (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="flex flex-col h-screen w-screen p-10 gap-10 px-20 overflow-x-hidden"
    >
      {/* Artifact Details Section */}
      <ArtifactDetails
        register={form.register}
        errors={form.formState.errors}
        onProfileUpload={(files) => {
          handleProfilePicture(files);
          setExistingProfile(null); // Clear existing when new one is uploaded
          const file = files[0];
          if (file) {
            form.setValue(
              "profilePicture",
              {
                originalName: file.name,
                fileName: file.name,
                fileSize: file.size,
                extension: file.name.split(".").pop() || "",
                mimeType: file.type,
                fileURL: URL.createObjectURL(file),
                uploadDate: new Date().toISOString(),
              },
              { shouldValidate: true },
            );
          }
        }}
        profilePreview={
          existingProfile?.fileURL ||
          (uploadedFiles.profilePicture
            ? URL.createObjectURL(
                uploadedFiles.profilePicture,
              )
            : null)
        }
      />

      {/* Sections */}
      <div className="pt-12">
        <h3 className="uppercase text-left pb-5">
          Section Subheadings
        </h3>
        {form.formState.errors.sections && (
          <p className="text-red-500 text-sm mb-2">
            {form.formState.errors.sections.message}
          </p>
        )}
        <Section
          sections={form.getValues().sections}
          activeSection={activeSection}
          onChange={handleSectionChange}
          onAdd={addNewSection}
          error={
            form.formState.errors.sections?.[activeSection]
              ?.message
          }
        />
      </div>

      {/* Reference Links */}
      <div>
        <h3 className="uppercase text-left pb-5">
          Reference Links
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <Input
                  label="Enter reference link"
                  placeholder="https://example.com"
                  defaultValue=""
                  ref={linkInputRef}
                  error={
                    form.formState.errors.referenceLinks
                      ?.message
                  }
                />
              </div>
              <div className="w-40">
                <Button
                  type="button"
                  placeholder="Add Link"
                  onClick={() => {
                    if (linkInputRef.current) {
                      handleAddLink(linkInputRef.current);
                    }
                  }}
                />
              </div>
            </div>

            {/* Reference Link Previews */}
            {(form.watch("referenceLinks") || []).map(
              (link: string, index: number) => {
                try {
                  const url = new URL(link);
                  return (
                    <UploadPreview
                      key={index}
                      fileName={url.hostname}
                      fileURL={link}
                      onDelete={() => {
                        const currentLinks =
                          form.getValues().referenceLinks ||
                          [];
                        form.setValue(
                          "referenceLinks",
                          currentLinks.filter(
                            (_: string, i: number) =>
                              i !== index,
                          ),
                          { shouldValidate: true },
                        );
                        form.clearErrors("referenceLinks");
                      }}
                    />
                  );
                } catch (e) {
                  return null;
                }
              },
            )}
          </div>
        </div>
      </div>

      {/* Audio Guide */}
      <AudioUpload
        audioFile={uploadedFiles.audioGuide}
        existingAudioUrl={existingAudio?.fileURL}
        onFileUpload={handleAudioUpload}
        onDelete={() => setExistingAudio(null)}
        error={form.formState.errors.audioGuide?.message}
      />

      {/* PDF Documents */}
      <DocumentUploads
        pdfs={[...existingPdfFiles, ...uploadedFiles.pdfs]}
        onFileUpload={handlePdfUpload}
        onDelete={(index) => {
          if (index < existingPdfs.length) {
            setExistingPdfs((pdfs) =>
              pdfs.filter((_, i) => i !== index),
            );
          } else {
            handlePdfDelete(index - existingPdfs.length);
          }
        }}
        error={form.formState.errors.pdfs?.message}
      />

      {/* Media Gallery */}
      <MediaGallery
        mediaFiles={uploadedFiles.media}
        existingFiles={existingMedia}
        onImageUpload={(files) =>
          handleMediaUpload("image")(files)
        }
        onVideoUpload={(files) =>
          handleMediaUpload("video")(files)
        }
        onDelete={(index, type) => {
          const isExistingFile =
            index <
            (type === "image"
              ? existingMedia.images.length
              : existingMedia.videos.length);

          if (isExistingFile) {
            setExistingMedia((prev) => ({
              ...prev,
              [type === "image" ? "images" : "videos"]:
                prev[
                  type === "image" ? "images" : "videos"
                ].filter((_, i) => i !== index),
            }));
          } else {
            const adjustedIndex =
              index -
              (type === "image"
                ? existingMedia.images.length
                : existingMedia.videos.length);
            handleMediaDelete(adjustedIndex, type);
          }
        }}
        error={form.formState.errors.mediaGallery?.message}
      />

      {/* Form Actions */}
      <div className="flex flex-col justify-between items-center pb-8 gap-4">
        {/* Submit button */}
        <Button
          placeholder={
            isSubmitting ? "Saving..." : "Update Artifact"
          }
          type="submit"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

export default EditCms;
