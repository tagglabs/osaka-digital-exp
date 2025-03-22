import { useCallback, useReducer } from "react";
import axios from "axios";
import {
  FileWithPreview,
  UploadManagerState,
  UploadStatus,
  UploadAction,
  UploadManager,
} from "../types/uploadManager";

// Create a new uploadable file state
const createUploadableFile = (
  file: File,
): FileWithPreview => ({
  file,
  originalName: file.name,
  fileName: file.name,
  fileSize: file.size,
  extension: file.name.split(".").pop() || "",
  mimeType: file.type,
  fileURL: "",
  preview: URL.createObjectURL(file),
  progress: 0,
  isUploading: false,
  uploaded: false,
});

// Initial state for the upload manager
const initialState: UploadManagerState = {
  profilePicture: null,
  pdfs: [],
  media: {
    images: [],
    videos: [],
  },
};

// Reducer to handle upload state changes
const uploadReducer = (
  state: UploadManagerState,
  action: UploadAction,
): UploadManagerState => {
  switch (action.type) {
    case "ADD_FILE": {
      const { fileType, file } = action.payload;
      const uploadableFile = createUploadableFile(file);

      switch (fileType) {
        case "profile":
          if (state.profilePicture?.preview) {
            URL.revokeObjectURL(
              state.profilePicture.preview,
            );
          }
          return {
            ...state,
            profilePicture: uploadableFile,
          };

        case "pdf":
          return {
            ...state,
            pdfs: [...state.pdfs, uploadableFile],
          };

        case "image":
          return {
            ...state,
            media: {
              ...state.media,
              images: [
                ...state.media.images,
                uploadableFile,
              ],
            },
          };

        case "video":
          return {
            ...state,
            media: {
              ...state.media,
              videos: [
                ...state.media.videos,
                uploadableFile,
              ],
            },
          };
      }
      break;
    }

    case "UPDATE_PROGRESS": {
      const { fileId, progress } = action.payload;
      return {
        ...state,
        profilePicture:
          state.profilePicture?.fileName === fileId
            ? {
                ...state.profilePicture,
                progress,
                isUploading: progress < 100,
              }
            : state.profilePicture,
        pdfs: state.pdfs.map((pdf) =>
          pdf.fileName === fileId
            ? {
                ...pdf,
                progress,
                isUploading: progress < 100,
              }
            : pdf,
        ),
        media: {
          images: state.media.images.map((img) =>
            img.fileName === fileId
              ? {
                  ...img,
                  progress,
                  isUploading: progress < 100,
                }
              : img,
          ),
          videos: state.media.videos.map((vid) =>
            vid.fileName === fileId
              ? {
                  ...vid,
                  progress,
                  isUploading: progress < 100,
                }
              : vid,
          ),
        },
      };
    }

    case "SET_ERROR": {
      const { fileId, error } = action.payload;
      return {
        ...state,
        profilePicture:
          state.profilePicture?.fileName === fileId
            ? {
                ...state.profilePicture,
                error,
                isUploading: false,
              }
            : state.profilePicture,
        pdfs: state.pdfs.map((pdf) =>
          pdf.fileName === fileId
            ? { ...pdf, error, isUploading: false }
            : pdf,
        ),
        media: {
          images: state.media.images.map((img) =>
            img.fileName === fileId
              ? { ...img, error, isUploading: false }
              : img,
          ),
          videos: state.media.videos.map((vid) =>
            vid.fileName === fileId
              ? { ...vid, error, isUploading: false }
              : vid,
          ),
        },
      };
    }

    case "SET_UPLOADED": {
      const { fileId, fileURL } = action.payload;
      return {
        ...state,
        profilePicture:
          state.profilePicture?.fileName === fileId
            ? {
                ...state.profilePicture,
                fileURL,
                uploaded: true,
                isUploading: false,
              }
            : state.profilePicture,
        pdfs: state.pdfs.map((pdf) =>
          pdf.fileName === fileId
            ? {
                ...pdf,
                fileURL,
                uploaded: true,
                isUploading: false,
              }
            : pdf,
        ),
        media: {
          images: state.media.images.map((img) =>
            img.fileName === fileId
              ? {
                  ...img,
                  fileURL,
                  uploaded: true,
                  isUploading: false,
                }
              : img,
          ),
          videos: state.media.videos.map((vid) =>
            vid.fileName === fileId
              ? {
                  ...vid,
                  fileURL,
                  uploaded: true,
                  isUploading: false,
                }
              : vid,
          ),
        },
      };
    }

    case "REMOVE_FILE": {
      const { fileType, fileId } = action.payload;
      switch (fileType) {
        case "profile":
          if (state.profilePicture?.preview) {
            URL.revokeObjectURL(
              state.profilePicture.preview,
            );
          }
          return { ...state, profilePicture: null };

        case "pdf":
          return {
            ...state,
            pdfs: state.pdfs.filter((pdf) => {
              if (pdf.fileName === fileId) {
                URL.revokeObjectURL(pdf.preview);
                return false;
              }
              return true;
            }),
          };

        case "image":
          return {
            ...state,
            media: {
              ...state.media,
              images: state.media.images.filter((img) => {
                if (img.fileName === fileId) {
                  URL.revokeObjectURL(img.preview);
                  return false;
                }
                return true;
              }),
            },
          };

        case "video":
          return {
            ...state,
            media: {
              ...state.media,
              videos: state.media.videos.filter((vid) => {
                if (vid.fileName === fileId) {
                  URL.revokeObjectURL(vid.preview);
                  return false;
                }
                return true;
              }),
            },
          };
      }
      break;
    }

    case "RESET_ALL": {
      // Cleanup all previews
      if (state.profilePicture?.preview) {
        URL.revokeObjectURL(state.profilePicture.preview);
      }
      state.pdfs.forEach((pdf) =>
        URL.revokeObjectURL(pdf.preview),
      );
      state.media.images.forEach((img) =>
        URL.revokeObjectURL(img.preview),
      );
      state.media.videos.forEach((vid) =>
        URL.revokeObjectURL(vid.preview),
      );
      return initialState;
    }
  }
  return state;
};

// Upload a single file to the server
const uploadFile = async (
  file: File,
  type: string,
  onProgress: (progress: number) => void,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  const response = await axios.post(
    "/api/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const progress =
          (progressEvent.loaded /
            (progressEvent.total || 0)) *
          100;
        onProgress(progress);
      },
    },
  );

  return response.data.fileURL;
};

export const useUploadManager = (): UploadManager => {
  const [state, dispatch] = useReducer(
    uploadReducer,
    initialState,
  );

  const addFile = useCallback(
    (
      type: "profile" | "pdf" | "image" | "video",
      files: File[],
    ) => {
      files.forEach((file) => {
        dispatch({
          type: "ADD_FILE",
          payload: { fileType: type, file },
        });
      });
    },
    [],
  );

  const removeFile = useCallback(
    (
      type: "profile" | "pdf" | "image" | "video",
      fileId: string,
    ) => {
      dispatch({
        type: "REMOVE_FILE",
        payload: { fileType: type, fileId },
      });
    },
    [],
  );

  const getStatus = useCallback((): UploadStatus => {
    const allFiles = [
      state.profilePicture,
      ...state.pdfs,
      ...state.media.images,
      ...state.media.videos,
    ].filter(Boolean) as FileWithPreview[];

    return {
      isUploading: allFiles.some((f) => f.isUploading),
      hasErrors: allFiles.some((f) => Boolean(f.error)),
      totalFiles: allFiles.length,
      uploadedFiles: allFiles.filter((f) => f.uploaded)
        .length,
    };
  }, [state]);

  const getFiles = useCallback(() => {
    return {
      profilePicture: state.profilePicture,
      pdfs: state.pdfs,
      mediaFiles: state.media,
    };
  }, [state]);

  const uploadAll = useCallback(async () => {
    const uploadQueue = [
      ...(state.profilePicture
        ? [{ type: "profile", file: state.profilePicture }]
        : []),
      ...state.pdfs.map((pdf) => ({
        type: "pdf",
        file: pdf,
      })),
      ...state.media.images.map((img) => ({
        type: "image",
        file: img,
      })),
      ...state.media.videos.map((vid) => ({
        type: "video",
        file: vid,
      })),
    ];

    for (const item of uploadQueue) {
      if (!item.file.uploaded && !item.file.isUploading) {
        try {
          const fileURL = await uploadFile(
            item.file.file,
            item.type,
            (progress) =>
              dispatch({
                type: "UPDATE_PROGRESS",
                payload: {
                  fileId: item.file.fileName,
                  progress,
                },
              }),
          );
          dispatch({
            type: "SET_UPLOADED",
            payload: {
              fileId: item.file.fileName,
              fileURL,
            },
          });
        } catch (error) {
          dispatch({
            type: "SET_ERROR",
            payload: {
              fileId: item.file.fileName,
              error:
                error instanceof Error
                  ? error.message
                  : "Upload failed",
            },
          });
        }
      }
    }
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  return {
    addFile,
    removeFile,
    getStatus,
    getFiles,
    uploadAll,
    reset,
  };
};
