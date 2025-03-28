import { Button } from "../Components/Button";
import { Input } from "../Components/Input";
import { Section } from "../Components/Section";
import LanguageToggle from "../Components/LanguageToggle";
import { useArtifactForm } from "../hooks/useArtifactForm";
import ArtifactDetails from "../Components/ArtifactDetails";
import DocumentUploads from "../Components/DocumentUploads";
import AudioUpload from "../Components/AudioUpload";
import MediaGallery from "../Components/MediaGallery";
import { UploadPreview } from "../Components/UploadPreview";
import Modal from "../Components/Modal";
import QRCode from "react-qr-code";

function Cms() {
  const {
    register,
    errors,
    isSubmitting,
    handleSubmit,
    sections,
    activeSection,
    language,
    toggleLanguage,
    addNewSection,
    handleSectionChange,
    deleteSection,
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
    isQRModalOpen,
    setIsQRModalOpen,
    handleDownloadQR,
    artifactCreated,
    artifact,
  } = useArtifactForm();

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-screen w-screen p-10 gap-10 px-20 overflow-x-hidden relative"
    >
      {/* Artifact Details Section */}
      {/* Language Toggle */}
      <LanguageToggle
        language={language}
        onToggle={toggleLanguage}
      />

      {/* Artifact Details */}
      <ArtifactDetails
        register={register}
        errors={errors}
        onProfileUpload={handleProfilePicture}
        profilePreview={profilePreview}
        language={language}
      />

      {/* Sections */}
      <div className="pt-12">
        <div className="flex items-center justify-between mb-5">
          <h3 className="uppercase text-left">
            Section Subheadings
          </h3>
        </div>

        <Section
          sections={sections.map((section) => ({
            ...section,
            titleJap: section.titleJap || "",
            contentJap: section.contentJap || "",
          }))}
          activeSection={activeSection}
          onChange={handleSectionChange}
          onAdd={addNewSection}
          onDelete={deleteSection}
          error={errors.sections?.[activeSection]?.message}
          language={language}
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
              {...register("referenceLink")}
              error={errors.referenceLink?.message}
            />
            <div className="w-40">
              <Button
                type="button"
                placeholder="Add Link"
                onClick={() => {
                  const value = (
                    document.querySelector(
                      'input[name="referenceLink"]',
                    ) as HTMLInputElement
                  ).value;
                  if (value) {
                    addReferenceLink(value);
                  }
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

        {/* Download QR button - only show when artifact is created */}
        {artifactCreated && artifact && (
          <Button
            placeholder="Download QR"
            type="button"
            onClick={() => setIsQRModalOpen(true)}
          />
        )}
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Artifact QR Code"
      >
        <div className="flex flex-col items-center gap-6">
          {artifact && (
            <QRCode
              id="qr-code"
              value={`http://localhost:5173/artifact/${artifact.id}`}
              size={256}
            />
          )}
          <Button
            placeholder="Save to device"
            type="button"
            onClick={handleDownloadQR}
          />
        </div>
      </Modal>
    </form>
  );
}

export default Cms;
