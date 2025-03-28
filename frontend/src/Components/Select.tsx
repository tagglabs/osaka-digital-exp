import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder: string;
  label: string;
  error?: string;
  options: string[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  placeholder,
  label,
  error,
  options,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] text-gray-primary uppercase">
        {label}
      </label>
      <select
        ref={ref}
        className={`w-full border-2 ${
          error ? "border-red-500" : "border-gray-primary"
        } rounded-md py-1 px-2`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
});