import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../Components/Button";
import { Dropzone } from "../Components/Dropzone";
import { Input } from "../Components/Input";
import { Section } from "../Components/Section";
import { SelectFileType } from "../Components/SelectFileType";
import { UploadPreview } from "../Components/UploadPreview";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  Artifact,
  MediaFile,
  Section as SectionType,
  APIResponse,
} from "../types/artifacts";

const mediaFileSchema = z.object({
  fileName: z.string(),
  fileSize: z.number(),
});

const mediaGallerySchema = z.object({
  images: z.array(mediaFileSchema),
  videos: z.array(mediaFileSchema),
});

const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z.string().min(1, "Section content is required"),
});

const artifactSchema = z.object({
  zoneName: z.string().min(1, "Zone name is required"),
  nameOfArtifact: z
    .string()
    .min(1, "Artifact name is required"),
  briefDescription: z
    .string()
    .min(1, "Brief description is required"),
  profilePicture: z.string().optional(),
  sections: z
    .array(sectionSchema)
    .min(1, "At least one section is required"),
  uploads: z.array(
    z.object({
      fileURL: z.string().min(1, "File URL is required"),
    }),
  ),
  mediaGallery: mediaGallerySchema,
  url: z.string().optional(),
});

type FormData = z.infer<typeof artifactSchema>;

export const EditCms = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState(0);
  const [activeMediaType, setActiveMediaType] = useState<
    "image" | "video"
  >("image");
  const [profilePreview, setProfilePreview] = useState<
    string | null
  >(null);
  const [sections, setSections] = useState<
    Array<{ title: string; content: string }>
  >([]);
  const [uploads, setUploads] = useState<
    { fileURL: string; fileName?: string }[]
  >([]);
  const [mediaFiles, setMediaFiles] = useState<{
    images: (MediaFile & { preview: string })[];
    videos: (MediaFile & { preview: string })[];
  }>({
    images: [],
    videos: [],
  });
  const [urlInput, setUrlInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      sections: [],
      uploads: [],
      mediaGallery: { images: [], videos: [] },
    },
  });

  // Fetch artifact data
  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await axios.get<
          APIResponse<Artifact>
        >(`/api/artifacts/${id}`);
        if (response.data.success && response.data.data) {
          const artifact = response.data.data;

          // Set form values
          reset({
            zoneName: artifact.zoneName,
            nameOfArtifact: artifact.nameOfArtifact,
            briefDescription: artifact.briefDescription,
            profilePicture: artifact.profilePicture,
            sections: artifact.sections,
            uploads: artifact.uploads,
            mediaGallery: artifact.mediaGallery,
            url: artifact.url,
          });

          // Set other state
          setProfilePreview(
            artifact.profilePicture || null,
          );
          setSections(artifact.sections);
          setUploads(artifact.uploads);
          setMediaFiles({
            images: artifact.mediaGallery.images.map(
              (img) => ({
                ...img,
                preview: img.fileName, // Using fileName as preview URL
              }),
            ),
            videos: artifact.mediaGallery.videos.map(
              (vid) => ({
                ...vid,
                preview: vid.fileName, // Using fileName as preview URL
              }),
            ),
          });
        } else {
          throw new Error(
            response.data.error ||
              "Failed to fetch artifact",
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to fetch artifact";
        setError(errorMessage);
        console.error("Error fetching artifact:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtifact();
  }, [id, reset]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      if (profilePreview)
        URL.revokeObjectURL(profilePreview);
      mediaFiles.images.forEach((file) =>
        URL.revokeObjectURL(file.preview),
      );
      mediaFiles.videos.forEach((file) =>
        URL.revokeObjectURL(file.preview),
      );
    };
  }, []);

  // Update form data when sections change
  useEffect(() => {
    setValue(
      "sections",
      sections.filter(
        (section) =>
          section.title.trim() !== "" ||
          section.content.trim() !== "",
      ),
    );
  }, [sections, setValue]);

  // Update form data when media changes
  useEffect(() => {
    setValue("mediaGallery", {
      images: mediaFiles.images.map(
        ({ preview, ...rest }) => rest,
      ),
      videos: mediaFiles.videos.map(
        ({ preview, ...rest }) => rest,
      ),
    });
  }, [mediaFiles, setValue]);

  // Update form data when uploads change
  useEffect(() => {
    setValue("uploads", uploads);
  }, [uploads, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const formData: Omit<Artifact, "_id"> = {
        zoneName: data.zoneName,
        nameOfArtifact: data.nameOfArtifact,
        briefDescription: data.briefDescription,
        profilePicture: data.profilePicture,
        sections: data.sections,
        uploads: data.uploads,
        mediaGallery: data.mediaGallery,
        url: data.url,
      };

      const response = await axios.put<
        APIResponse<Artifact>
      >(`/api/artifacts/${id}`, formData);

      if (response.data.success) {
        alert("Artifact updated successfully");
        navigate("/dashboard");
      } else {
        throw new Error(
          response.data.error ||
            "Failed to update artifact",
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update artifact";
      alert(errorMessage);
      console.error("Error updating artifact:", err);
    }
  };

  const addNewSection = () => {
    const newSections = [
      ...sections,
      { title: "Untitled", content: "" },
    ];
    setSections(newSections);
    setActiveSection(newSections.length - 1);
    setValue("sections", newSections);
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
    setValue("sections", newSections);
  };

  const handleFileDelete = (
    index: number,
    type: "upload" | "media",
  ) => {
    if (type === "upload") {
      const newUploads = [...uploads];
      newUploads.splice(index, 1);
      setUploads(newUploads);
    } else {
      const newMediaFiles = { ...mediaFiles };
      if (activeMediaType === "image") {
        URL.revokeObjectURL(
          newMediaFiles.images[index].preview,
        );
        newMediaFiles.images.splice(index, 1);
      } else {
        URL.revokeObjectURL(
          newMediaFiles.videos[index].preview,
        );
        newMediaFiles.videos.splice(index, 1);
      }
      setMediaFiles(newMediaFiles);
    }
  };

  const handleUrlUpload = () => {
    if (urlInput.trim()) {
      const fileName = urlInput.split("/").pop() || "file";
      setUploads([
        ...uploads,
        { fileURL: urlInput, fileName },
      ]);
      setUrlInput("");
    }
  };

  const handleProfilePicture = (files: File[]) => {
    if (files.length > 0) {
      if (profilePreview)
        URL.revokeObjectURL(profilePreview);
      const preview = URL.createObjectURL(files[0]);
      setProfilePreview(preview);
      setValue("profilePicture", preview);
    }
  };

  const handleMediaUpload = (files: File[]) => {
    const newFiles = files.map((file) => ({
      fileName: file.name,
      fileSize: file.size,
      preview: URL.createObjectURL(file),
    }));

    if (activeMediaType === "image") {
      setMediaFiles((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    } else {
      setMediaFiles((prev) => ({
        ...prev,
        videos: [...prev.videos, ...newFiles],
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-screen w-screen p-10 gap-10"
    >
      <div>
        <h2 className="uppercase text-left pb-5">
          Edit Artefact Details
        </h2>
        <div className="w-full flex gap-10 h-[200px]">
          <div className="w-1/2 flex flex-col gap-2">
            <Input
              label="Enter artefact zone"
              placeholder="Enter"
              {...register("zoneName")}
              error={errors.zoneName?.message}
            />
            <Input
              label="Enter name of artefact"
              placeholder="Enter"
              {...register("nameOfArtifact")}
              error={errors.nameOfArtifact?.message}
            />
            <Input
              label="Enter brief description"
              placeholder="Enter"
              {...register("briefDescription")}
              error={errors.briefDescription?.message}
            />
          </div>
          <div className="w-1/2 h-full">
            <p className="text-[12px] pb-2 text-gray-primary uppercase">
              Upload Profile picture
            </p>
            <div className="flex gap-4">
              <div className="w-1/2">
                <Dropzone
                  id="profile"
                  onDrop={handleProfilePicture}
                  accept="image/*"
                />
              </div>
              {profilePreview && (
                <div className="w-1/2 h-[150px]">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="uppercase text-left pb-5">
          Section Subheadings
        </h3>
        {errors.sections && (
          <p className="text-red-500 text-sm mb-2">
            {errors.sections.message}
          </p>
        )}
        <Section
          sections={sections}
          activeSection={activeSection}
          onChange={handleSectionChange}
          onAdd={addNewSection}
          error={errors.sections?.[activeSection]?.message}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="uppercase text-left pb-5">Pdfs</h3>
        <p className="text-[12px] text-gray-primary uppercase">
          Uploads
        </p>
        <div className="flex flex-col gap-1">
          {uploads.map((upload, index) => (
            <UploadPreview
              key={index}
              fileURL={upload.fileURL}
              fileName={upload.fileName}
              onDelete={() =>
                handleFileDelete(index, "upload")
              }
            />
          ))}
        </div>
        <div className="flex gap-4 items-end">
          <Input
            placeholder="https://"
            label="Paste Url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button
            placeholder="Upload URL"
            type="button"
            onClick={handleUrlUpload}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="uppercase text-left pb-5">
          Media Gallery
        </h3>
        <div className="flex w-full gap-6">
          <SelectFileType
            placeholder="Image"
            extension="PNG, JPEG, JPG"
            selected={activeMediaType === "image"}
            onClick={() => setActiveMediaType("image")}
          />
          <SelectFileType
            placeholder="Video"
            extension="AVI, MOV, MP4"
            selected={activeMediaType === "video"}
            onClick={() => setActiveMediaType("video")}
          />
        </div>
        <Dropzone
          id="media"
          onDrop={handleMediaUpload}
          accept={
            activeMediaType === "image"
              ? "image/*"
              : "video/*"
          }
          multiple={true}
        />
        <p className="text-[12px] text-gray-primary uppercase">
          Uploads
        </p>
        <div className="flex flex-col gap-1">
          {(activeMediaType === "image"
            ? mediaFiles.images
            : mediaFiles.videos
          ).map((file, index) => (
            <div key={index} className="flex gap-2">
              <UploadPreview
                fileName={file.fileName}
                fileSize={file.fileSize}
                onDelete={() =>
                  handleFileDelete(index, "media")
                }
              />
              {activeMediaType === "image" ? (
                <img
                  src={file.preview}
                  alt={file.fileName}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <video
                  src={file.preview}
                  className="w-20 h-20 object-cover rounded"
                  controls
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between items-center pb-8 gap-4">
        {errors.root && (
          <p className="text-red-500 text-sm">
            {errors.root.message}
          </p>
        )}
        <Button placeholder="Save Changes" type="submit" />
      </div>
    </form>
  );
};
