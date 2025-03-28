import { useCallback, useState } from "react";
import axios from "axios";
import {
  FileDetails,
  FileType,
  FileStorageState,
  UploadResult,
  UploadManager,
} from "../types/uploadManager";

// Initial state
const initialState: FileStorageState = {
  profilePicture: null,
  audioGuide: null,
  pdfs: [],
  media: {
    images: [],
    videos: [],
  },
};

// Upload a single file and get its details
const uploadFile = async (
  file: File,
  type: string,
): Promise<FileDetails> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await axios.post<{ fileURL: string }>(
    "/api/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return {
    originalName: file.name,
    fileName: file.name,
    fileSize: file.size,
    extension: file.name.split(".").pop() || "",
    mimeType: file.type,
    fileURL: response.data.fileURL,
    preview: URL.createObjectURL(file),
  };
};

export const useUploadManager = (): UploadManager => {
  const [state, setState] =
    useState<FileStorageState>(initialState);

  const addFile = useCallback(
    (type: FileType, files: File[]) => {
      setState((prev) => {
        switch (type) {
          case "profile":
            // Only keep the last file for profile picture
            return {
              ...prev,
              profilePicture: files[0],
            };
          case "audio":
            // Only keep the last file for audio guide
            return {
              ...prev,
              audioGuide: files[0],
            };
          case "pdf":
            return {
              ...prev,
              pdfs: [...prev.pdfs, ...files],
            };
          case "image":
            return {
              ...prev,
              media: {
                ...prev.media,
                images: [...prev.media.images, ...files],
              },
            };
          case "video":
            return {
              ...prev,
              media: {
                ...prev.media,
                videos: [...prev.media.videos, ...files],
              },
            };
        }
      });
    },
    [],
  );

  const removeFile = useCallback(
    (type: FileType, fileName: string) => {
      setState((prev) => {
        switch (type) {
          case "profile":
            return {
              ...prev,
              profilePicture: null,
            };
          case "audio":
            return {
              ...prev,
              audioGuide: null,
            };
          case "pdf":
            return {
              ...prev,
              pdfs: prev.pdfs.filter(
                (f) => f.name !== fileName,
              ),
            };
          case "image":
            return {
              ...prev,
              media: {
                ...prev.media,
                images: prev.media.images.filter(
                  (f) => f.name !== fileName,
                ),
              },
            };
          case "video":
            return {
              ...prev,
              media: {
                ...prev.media,
                videos: prev.media.videos.filter(
                  (f) => f.name !== fileName,
                ),
              },
            };
        }
      });
    },
    [],
  );

  const uploadAll =
    useCallback(async (): Promise<UploadResult> => {
      // Handle profile picture
      const profilePromise = state.profilePicture
        ? uploadFile(state.profilePicture, "profile")
        : Promise.resolve(undefined);

      // Handle audio guide
      const audioPromise = state.audioGuide
        ? uploadFile(state.audioGuide, "audio")
        : Promise.resolve(undefined);

      // Handle PDFs
      const pdfsPromise = Promise.all(
        state.pdfs.map((file) => uploadFile(file, "pdf")),
      );

      // Handle images and videos
      const imagesPromise = Promise.all(
        state.media.images.map((file) =>
          uploadFile(file, "image"),
        ),
      );
      const videosPromise = Promise.all(
        state.media.videos.map((file) =>
          uploadFile(file, "video"),
        ),
      );

      // Wait for all uploads to complete
      const [profilePicture, audioGuide, pdfs, images, videos] =
        await Promise.all([
          profilePromise,
          audioPromise,
          pdfsPromise,
          imagesPromise,
          videosPromise,
        ]);

      return {
        profilePicture,
        audioGuide,
        pdfs,
        mediaGallery: {
          images,
          videos,
        },
      };
    }, [state]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const getSelectedFiles =
    useCallback((): FileStorageState => {
      return state;
    }, [state]);

  return {
    addFile,
    removeFile,
    getSelectedFiles,
    uploadAll,
    reset,
  };
};
