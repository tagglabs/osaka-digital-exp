interface SelectFileTypeProps {
  placeholder: string;
  extension: string;
  selected?: boolean;
  onClick?: () => void;
}

export const SelectFileType = ({
  placeholder,
  extension,
  selected = false,
  onClick,
}: SelectFileTypeProps) => {
  return (
    <div 
      className={`flex items-center justify-between gap-2 cursor-pointer ${
        selected ? 'opacity-100' : 'opacity-50'
      }`}
      onClick={onClick}
    >
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
