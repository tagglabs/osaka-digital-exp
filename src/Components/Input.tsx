interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  label: string;
  error?: string;
}

export const Input = ({
  placeholder,
  label,
  error,
  ...props
}: InputProps) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] text-gray-primary uppercase">
        {label}
      </label>
      <input
        type="text"
        className={`w-full border-2 ${
          error ? "border-red-500" : "border-gray-primary"
        } rounded-md py-1 px-2`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
};
