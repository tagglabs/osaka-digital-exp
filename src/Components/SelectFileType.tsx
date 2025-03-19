interface SelectFileTypeProps {
  placeholder: string;
  extension: string;
}

export const SelectFileType = ({
  placeholder,
  extension,
}: SelectFileTypeProps) => {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="size-[30px] rounded-full bg-gray-300"></div>
      <div className="flex flex-col">
        <p> {placeholder} </p>
        <p className="text-gray-primary text-[10px] uppercase">
          File Type: {extension}
        </p>
      </div>
    </div>
  );
};
