import Trash from "../assets/trash.png";

export const UploadPreview = () => {
  return (
    <div className="w-full border-2 border-gray-secondary rounded-md flex justify-between items-center pl-1 pr-4">
      <div className="flex  items-center justify-between gap-2">
        <div className="size-[30px] rounded-sm bg-gray-300"></div>
        <div className="flex flex-col">
          <p>File Name.pdf</p>
          <p className="text-gray-primary text-[10px] uppercase">
            20mb
          </p>
        </div>
      </div>
      <img src={Trash} alt="delete" />
    </div>
  );
};
