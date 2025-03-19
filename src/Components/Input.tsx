interface InputProps {
  placeholder: string;
  label: string;
}

export const Input = ({placeholder, label}: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] text-gray-primary uppercase">
        {label}
      </label>
      <input
        type="text"
        className="w-full border-2 border-gray-primary rounded-md py-1 px-2"
        placeholder={placeholder}
      />
    </div>
  );
};
