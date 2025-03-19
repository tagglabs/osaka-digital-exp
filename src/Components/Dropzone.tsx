import dropzone from "../assets/dropzone.png";

export const Dropzone = () => {
  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full pt-2 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center">
          <img src={dropzone} alt="dropzone" className="object-contain size-[40px]" />
          <p className="mb-1 ">
            Drag & Drop to upload media
          </p>
          <p className="text-[8px] text-gray-primary uppercase">
            or
          </p>
          <button className="px-4 py-2 my-1 bg-gray-300 rounded-l-full rounded-r-full text-[10px]">
            Upload files
          </button>
          <p className="mb-2 text-[10px] uppercase text-red-500">
            mAXIMUM FILE SIZE: 100MB
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
        />
      </label>
    </div>
  );
};
