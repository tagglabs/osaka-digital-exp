import { Dropzone } from "./Dropzone";
import { UploadPreview } from "./UploadPreview";

interface AudioUploadProps {
  audioFile: File | null;
  existingAudioUrl?: string;
  onFileUpload: (files: File[]) => void;
  onDelete?: () => void;
  error?: string;
}

function AudioUpload({
  audioFile,
  existingAudioUrl,
  onFileUpload,
  onDelete,
  error,
}: AudioUploadProps) {
  return (
    <div>
      <h3 className="uppercase text-left pb-5">Audio Guide</h3>
      <div className="space-y-4">
        <Dropzone
          onDrop={onFileUpload}
          accept="audio/mpeg"
          multiple={false}
          id="audio-guide"
          error={error}
        />
        
        {(audioFile || existingAudioUrl) && (
          <div className="mt-4">
            {/* <div className="mb-3">
              <UploadPreview
                fileName={audioFile ? audioFile.name : "Audio Guide"}
                fileSize={audioFile ? audioFile.size : 0}
                onDelete={onDelete}
              />
            </div> */}
            <audio
              controls
              className="w-full"
              src={audioFile ? URL.createObjectURL(audioFile) : existingAudioUrl}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioUpload;