import { Button } from "../Components/Button";
import { Dropzone } from "../Components/Dropzone";
import { Input } from "../Components/Input";
import { Section } from "../Components/Section";
import { SelectFileType } from "../Components/SelectFileType";
import { UploadPreview } from "../Components/UploadPreview";

function Cms() {
  return (
    <div className="flex flex-col h-screen w-screen p-10 gap-10">
      <div>
        <h2 className="uppercase text-left pb-5">
          Artefact Details
        </h2>
        <div className="w-full flex gap-10 h-[200px]">
          <div className="w-1/2 flex flex-col gap-2">
            <Input
              label="Enter artefact zone"
              placeholder="Enter"
            />
            <Input
              label="Enter name of artefact"
              placeholder="Enter"
            />
            <Input
              label="Enter brief description"
              placeholder="Enter"
            />
          </div>
          <div className="w-1/2 h-full">
            <p className="text-[12px] pb-2 text-gray-primary uppercase">
              Upload Profile picture
            </p>
            <Dropzone />
          </div>
        </div>
      </div>
      <div>
        <h3 className="uppercase text-left pb-5">
          Section Subheadings
        </h3>
        <Section />
        <div className="flex justify-end">
          <Button placeholder="Add New Section" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="uppercase text-left pb-5">Pdfs</h3>
        <p className="text-[12px] text-gray-primary uppercase">
          Uploads
        </p>
        <div className="flex flex-col gap-1">
          <UploadPreview />
          <UploadPreview />
        </div>
        <Input placeholder="https://" label="Paste Url" />
        <div>
          <p className="mb-2 text-[10px] uppercase text-red-500">
            MAXIMUM FILE SIZE: 100MB
          </p>
          <Button placeholder="Upload Files" />
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
          />
          <SelectFileType
            placeholder="Video"
            extension="AVI, MOV, MP4"
          />
        </div>
        <Dropzone />
        <p className="text-[12px] text-gray-primary uppercase">
          Uploads
        </p>
        <div className="flex flex-col gap-1">
          <UploadPreview />
          <UploadPreview />
        </div>
      </div>
      <div className="flex flex-col justify-between items-center pb-8">
        <Button placeholder="Save Changes" />
        <Button placeholder="Download QR" />
      </div>
    </div>
  );
}

export default Cms;
