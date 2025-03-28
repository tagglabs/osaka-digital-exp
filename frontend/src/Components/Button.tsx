interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  placeholder: string;
  showIcon?: boolean;
}

export const Button = ({ placeholder, showIcon, ...props }: ButtonProps) => {
  const shouldShowIcon = showIcon ?? placeholder.toLowerCase().startsWith('add');
  
  return (
    <button
      className="px-4 py-2 my-1 bg-[#666464] rounded-l-full rounded-r-full text-[15px] text-white flex items-center justify-center gap-2"
      {...props}
    >
      {shouldShowIcon && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 0V14M0 7H14"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      )}
      {placeholder}
    </button>
  );
};
