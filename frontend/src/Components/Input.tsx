import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  label: string;
  error?: string;
  style?: React.CSSProperties;
}

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ placeholder, label, error, style, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1" style={style}>
      <label className="text-[12px] text-gray-primary uppercase">
        {label.split("*").map((part, index, array) => (
          <React.Fragment key={index}>
            {part}
            {index < array.length - 1 && (
              <span className="text-red-500">*</span>
            )}
          </React.Fragment>
        ))}
      </label>
      <input
        ref={ref}
        type="text"
        className={`w-full border-2 ${
          error ? "border-red-500" : "border-gray-primary"
        } rounded-md py-1 px-2`}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
});
