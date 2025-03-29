import React from "react";
import {
  UseFormRegister,
  FieldErrors,
} from "react-hook-form";
import { FormData } from "../types/artifacts";
import { Input } from "./Input";
import { Select } from "./Select";
import { Dropzone } from "./Dropzone";

interface ArtifactDetailsProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  onProfileUpload: (files: File[]) => void;
  profilePreview: string | null;
  language: "en" | "jp";
}

const ArtifactDetails: React.FC<ArtifactDetailsProps> = ({
  register,
  errors,
  onProfileUpload,
  profilePreview,
  language,
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
            options={[
              "zone1",
              "zone2",
              "zone3",
              "zone4",
              "zone5",
              "zone6",
              "zone7",
              "zone8",
              "zone9",
            ]}
          />
          {/* English Inputs */}
          <Input
            label="Enter artifact name (English) *"
            placeholder="Enter artifact name"
            {...register("artifactName")}
            error={errors.artifactName?.message}
            style={{
              display: language === "en" ? "block" : "none",
            }}
          />
          <Input
            label="Enter description (English) *"
            placeholder="Enter description"
            {...register("description")}
            error={errors.description?.message}
            style={{
              display: language === "en" ? "block" : "none",
            }}
          />

          {/* Japanese Inputs */}
          <Input
            label="Enter artifact name (Japanese)"
            placeholder="名前を入力してください"
            {...register("artifactNameJap")}
            error={errors.artifactNameJap?.message}
            style={{
              display: language === "jp" ? "block" : "none",
            }}
          />
          <Input
            label="Enter description (Japanese)"
            placeholder="説明を入力してください"
            {...register("descriptionJap")}
            error={errors.descriptionJap?.message}
            style={{
              display: language === "jp" ? "block" : "none",
            }}
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
              error={
                profilePreview === null &&
                ("Profile picture is required !" as string)
              }
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
