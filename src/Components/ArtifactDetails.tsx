import React from "react";
import {
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import { FormData } from "../types/artifacts";
import { Input } from "../Components/Input";
import { Select } from "../Components/Select";
import { artifactSchema } from "../types/artifacts";
import { Dropzone } from "../Components/Dropzone";

interface ArtifactDetailsProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onProfileUpload: (files: File[]) => void;
  profilePreview: string | null;
}

const ArtifactDetails: React.FC<ArtifactDetailsProps> = ({
  register,
  errors,
  onProfileUpload,
  profilePreview,
}) => {
  return (
    <div>
      <h2 className="uppercase text-left pb-5">
        Artifact Details
      </h2>
      <div className="w-full flex gap-10 h-[200px]">
        <div className="w-1/2 flex flex-col gap-5">
          <Select
            label="Enter zone name *"
            placeholder="Select zone"
            {...register("zoneName")}
            error={errors.zoneName?.message}
            options={["zone1", "zone2", "zone3", "zone4", "zone5", "zone6", "zone7", "zone8", "zone9"]}
          />
          <Input
            label="Enter artifact name *"
            placeholder="Enter artifact name"
            {...register("artifactName")}
            error={errors.artifactName?.message}
          />
          <Input
            label="Enter description *"
            placeholder="Enter description"
            {...register("description")}
            error={errors.description?.message}
          />
        </div>
        <div className="w-1/2 h-full">
          <p className="text-[12px] pb-2 text-gray-primary uppercase">
            Upload Profile Picture
          </p>
          <div className="relative w-full h-[200px]">
            <Dropzone
              id="profile"
              onDrop={onProfileUpload}
              accept="image/*"
            />
            {profilePreview && (
              <div className="absolute right-10 top-8 w-[100px] h-[100px]">
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-300"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtifactDetails;
