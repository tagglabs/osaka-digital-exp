import { Dropzone } from "./Dropzone";
import { UploadPreview } from "./UploadPreview";

interface AudioUploadProps {
  audioFile: File | null;
  onFileUpload: (files: File[]) => void;
  onDelete?: () => void;
  error?: string;
}

function AudioUpload({
  audioFile,
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
        
        {audioFile && (
          <div className="mt-4">
            <div className="mb-3">
              {/* <UploadPreview
                fileName={audioFile.name}
                fileSize={audioFile.size}
                onDelete={onDelete}
              /> */}
            </div>
            <audio
              controls
              className="w-full"
              src={URL.createObjectURL(audioFile)}
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