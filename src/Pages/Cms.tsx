import { Button } from "../Components/Button";
import { Input } from "../Components/Input";
import { Section } from "../Components/Section";
import { useArtifactForm } from "../hooks/useArtifactForm";
import ArtifactDetails from "../Components/ArtifactDetails";
import DocumentUploads from "../Components/DocumentUploads";
import AudioUpload from "../Components/AudioUpload";
import MediaGallery from "../Components/MediaGallery";
import { UploadPreview } from "../Components/UploadPreview";

function Cms() {
  const {
    register,
    errors,
    isSubmitting,
    handleSubmit,
    sections,
    activeSection,
    addNewSection,
    handleSectionChange,
    profilePreview,
    pdfs,
    mediaFiles,
    audioFile,
    handleProfilePicture,
    handlePdfUpload,
    handlePdfDelete,
    handleAudioUpload,
    handleMediaUpload,
    handleMediaDelete,
    referenceLinks,
    addReferenceLink,
    deleteReferenceLink,
  } = useArtifactForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-screen w-screen p-10 gap-10 px-20"
    >
      {/* Artifact Details Section */}
      <ArtifactDetails
        register={register}
        errors={errors}
        onProfileUpload={handleProfilePicture}
        profilePreview={profilePreview}
      />

      {/* Sections */}
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

      {/* Reference Links */}
      <div>
        <h3 className="uppercase text-left pb-5">
          Reference Links
        </h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <Input
              label="Enter reference link"
              placeholder="https://example.com"
              {...register("referenceLinks")}
              error={errors.referenceLinks?.message}
              onKeyDown={(
                e: React.KeyboardEvent<HTMLInputElement>,
              ) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const input =
                    e.target as HTMLInputElement;
                  addReferenceLink(input.value);
                  input.value = "";
                }
              }}
            />
            <div className="w-40">
              <Button
                type="button"
                placeholder="Add Link"
                onClick={() => {
                  const input = document.querySelector(
                    'input[name="referenceLinks"]',
                  ) as HTMLInputElement;
                  addReferenceLink(input.value);
                  input.value = "";
                }}
              />
            </div>
          </div>
          {referenceLinks.map((link, index) => (
            <UploadPreview
              key={index}
              fileName={new URL(link).hostname}
              fileURL={link}
              onDelete={() => deleteReferenceLink(index)}
            />
          ))}
        </div>
      </div>

      {/* PDF Documents */}
      <DocumentUploads
        pdfs={pdfs}
        onFileUpload={handlePdfUpload}
        onDelete={handlePdfDelete}
        error={errors.pdfs?.message}
      />

      {/* Audio Guide */}
      <AudioUpload
        audioFile={audioFile}
        onFileUpload={handleAudioUpload}
        // onDelete={() => handleAudioUpload()}
        error={errors.audioGuide?.message}
      />

      {/* Media Gallery */}
      <MediaGallery
        mediaFiles={mediaFiles}
        onImageUpload={(files) =>
          handleMediaUpload("image")(files)
        }
        onVideoUpload={(files) =>
          handleMediaUpload("video")(files)
        }
        onDelete={handleMediaDelete}
        error={errors.mediaGallery?.message}
      />

      {/* Form Actions */}
      <div className="flex flex-col justify-between items-center pb-8 gap-4">
        {/* Root level errors */}
        {errors.root && (
          <p className="text-red-500 text-sm">
            {errors.root.message}
          </p>
        )}

        {/* Submit button */}
        <Button
          placeholder={
            isSubmitting ? "Saving..." : "Save Changes"
          }
          type="submit"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
}

export default Cms;
