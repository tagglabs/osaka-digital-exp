import React from "react";
import {
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import { FormData } from "../types/artifacts";
import { Input } from "../Components/Input";
import { Select } from "../Components/Select";
import { ZONES } from "../constants/zones";
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
        <div className="w-1/2 flex flex-col gap-2">
          <Select
            label="Enter zone name *"
            placeholder="Select zone"
            {...register("zoneName")}
            error={errors.zoneName?.message}
            options={[...ZONES]}
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
          <div className="flex gap-4">
            <div className="w-1/2">
              <Dropzone
                id="profile"
                onDrop={onProfileUpload}
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
  );
};

export default ArtifactDetails;
