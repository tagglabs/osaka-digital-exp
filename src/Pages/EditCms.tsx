import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "../Components/Button";
import { Section } from "../Components/Section";
import { useArtifactForm } from "../hooks/useArtifactForm";
import ArtifactDetails from "../Components/ArtifactDetails";
import DocumentUploads from "../Components/DocumentUploads";
import MediaGallery from "../Components/MediaGallery";
import AudioUpload from "../Components/AudioUpload";
import { FormData, SectionType, artifactSchema, FileType } from "../types/artifacts";
import { FileDetails, MediaGallery as MediaGalleryType } from "../types/uploadManager";

function EditCms() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [existingProfile, setExistingProfile] = useState<FileDetails | null>(null);
  const [existingPdfs, setExistingPdfs] = useState<FileDetails[]>([]);
  const [existingAudio, setExistingAudio] = useState<FileDetails | null>(null);
  const [existingMedia, setExistingMedia] = useState<MediaGalleryType>({
    images: [],
    videos: [],
  });
  const [activeSection, setActiveSection] = useState(0);

  // Form initialization with default values
  const form = useForm<FormData>({
    resolver: zodResolver(artifactSchema),
    defaultValues: {
      zoneName: "",
      artifactName: "",
      description: "",
      sections: [{ title: "Overview", content: "" }],
      pdfs: [],
      mediaGallery: [],
      audioGuide: undefined
    }
  });

  const {
    isSubmitting,
    profilePreview: newProfilePreview,
    pdfs: newPdfs,
    mediaFiles: newMediaFiles,
    handleProfilePicture,
    handlePdfUpload,
    handlePdfDelete,
    handleMediaUpload,
    handleMediaDelete,
    audioFile: newAudioFile,
    handleAudioUpload,
  } = useArtifactForm();


  const handleSectionChange = (index: number, title: string, content: string) => {
    setActiveSection(index);
    const updatedSections = [...form.getValues().sections];
    updatedSections[index] = { title, content };
    form.setValue('sections', updatedSections, { shouldValidate: true });
  };

  const addNewSection = () => {
    const currentSections = form.getValues().sections;
    form.setValue('sections', [...currentSections, { title: '', content: '' }], { shouldValidate: true });
    setActiveSection(currentSections.length);
  };

  // Convert file details to File objects for preview
  const convertToFiles = (pdfs: FileType[]) => {
    return pdfs.map(pdf => {
      const response = fetch(pdf.fileURL)
        .then(res => res.blob())
        .then(blob => new File([blob], pdf.originalName, { type: pdf.mimeType }));
      return response;
    });
  };

  // Fetch artifact details
  useEffect(() => {
    const fetchArtifact = async () => {
      try {
        const response = await axios.get(`/api/artifacts/${id}`);
        const artifact: FormData = response.data;

        // Set form values
        form.reset({
          zoneName: artifact.zoneName,
          artifactName: artifact.artifactName,
          description: artifact.description,
          sections: artifact.sections,
          pdfs: artifact.pdfs || [],
          mediaGallery: artifact.mediaGallery || [],
          profilePicture: artifact.profilePicture
        });

        // Set existing files with previews
        if (artifact.profilePicture) {
          setExistingProfile({
            ...artifact.profilePicture,
            preview: artifact.profilePicture.fileURL
          } as FileDetails);
        }

        // Set existing PDFs
        if (artifact.pdfs && artifact.pdfs.length > 0) {
          const pdfsWithPreviews = artifact.pdfs.map(pdf => ({
            ...pdf,
            preview: pdf.fileURL
          })) as FileDetails[];
          setExistingPdfs(pdfsWithPreviews);
        }

        if (artifact.mediaGallery) {
          const images: FileDetails[] = [];
          const videos: FileDetails[] = [];

          artifact.mediaGallery.forEach((file) => {
            const fileWithPreview = {
              ...file,
              preview: file.fileURL
            } as FileDetails;

            if (file.mimeType.startsWith('image/')) {
              images.push(fileWithPreview);
            } else if (file.mimeType.startsWith('video/')) {
              videos.push(fileWithPreview);
            }
          });

          setExistingMedia({ images, videos });
        }

        // Set existing audio file
        if (artifact.audioGuide) {
          setExistingAudio({
            ...artifact.audioGuide,
            preview: artifact.audioGuide.fileURL
          } as FileDetails);
        }

      } catch (error) {
        console.error("Error fetching artifact:", error);
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
    
    try {
      // Combine existing and new media files
      const mediaGallery = [
        ...existingMedia.images,
        ...existingMedia.videos,
        ...formData.mediaGallery || []
      ];

      const updateData = {
        ...formData,
        pdfs: [...existingPdfs, ...formData.pdfs || []],
        mediaGallery,
        profilePicture: existingProfile || formData.profilePicture,
        audioGuide: existingAudio || formData.audioGuide
      };

      await axios.put(`/api/artifacts/${id}`, updateData);
      alert("Artifact updated successfully!");
    } catch (error) {
      console.error("Error updating artifact:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Convert FileDetails to File objects for DocumentUploads
  const existingPdfFiles = existingPdfs.map((pdf: FileDetails) => {
    return new File(
      [new Blob([], { type: pdf.mimeType })], 
      pdf.originalName, 
      { type: pdf.mimeType }
    );
  });

  return (
    <form
      onSubmit={form.handleSubmit(handleFormSubmit)}
      className="flex flex-col h-screen w-screen p-10 gap-10"
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
            form.setValue('profilePicture', {
              originalName: file.name,
              fileName: file.name,
              fileSize: file.size,
              extension: file.name.split('.').pop() || '',
              mimeType: file.type,
              fileURL: URL.createObjectURL(file)
            });
          }
        }}
        profilePreview={existingProfile?.fileURL || newProfilePreview || form.getValues().profilePicture?.fileURL || null}
      />

      {/* Sections */}
      <div>
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
          error={form.formState.errors.sections?.[activeSection]?.message}
        />
      </div>

      {/* Audio Guide */}
      <AudioUpload
        audioFile={newAudioFile}
        existingAudioUrl={existingAudio?.fileURL}
        onFileUpload={handleAudioUpload}
        onDelete={() => setExistingAudio(null)}
        error={form.formState.errors.audioGuide?.message}
      />

      {/* PDF Documents */}
      <DocumentUploads
        pdfs={[...existingPdfFiles, ...newPdfs]}
        onFileUpload={handlePdfUpload}
        onDelete={(index) => {
          if (index < existingPdfs.length) {
            setExistingPdfs(pdfs => pdfs.filter((_, i) => i !== index));
          } else {
            handlePdfDelete(index - existingPdfs.length);
          }
        }}
        error={form.formState.errors.pdfs?.message}
      />

      {/* Media Gallery */}
      <MediaGallery
        mediaFiles={newMediaFiles}
        existingFiles={existingMedia}
        onImageUpload={(files) => handleMediaUpload("image")(files)}
        onVideoUpload={(files) => handleMediaUpload("video")(files)}
        onDelete={(index, type) => {
          const isExistingFile = index < (type === 'image' ? existingMedia.images.length : existingMedia.videos.length);
          
          if (isExistingFile) {
            setExistingMedia(prev => ({
              ...prev,
              [type === 'image' ? 'images' : 'videos']: prev[type === 'image' ? 'images' : 'videos'].filter((_, i) => i !== index)
            }));
          } else {
            const adjustedIndex = index - (type === 'image' ? existingMedia.images.length : existingMedia.videos.length);
            handleMediaDelete(adjustedIndex, type);
          }
        }}
        error={form.formState.errors.mediaGallery?.message}
      />

      {/* Form Actions */}
      <div className="flex flex-col justify-between items-center pb-8 gap-4">
        {/* Root level errors */}
        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

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