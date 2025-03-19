interface ButtonProps {
  placeholder: string;
}

export const Button = ({placeholder}: ButtonProps) => {
  return (
    <button className="px-4 py-2 my-1 bg-[#666464] rounded-l-full rounded-r-full text-[15px] text-white">
        {placeholder}
    </button>
  );
};
