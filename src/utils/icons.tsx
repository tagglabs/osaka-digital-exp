import React from "react";

const IconsSVGObject = [
  {
    name: "Bookmark",
    svg: (
      <svg
        width="14"
        height="17"
        viewBox="0 0 14 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.21802 14.8513V1.36365H12.2329V14.8513L6.86315 10.9436L1.21802 14.8513Z"
          stroke="black"
          strokeWidth="2.1361"
        />
      </svg>
    ),
  },
  {
    name: "Downloads",
    svg: (
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15"
          stroke="#1C274C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 3V16M12 16L16 11.625M12 16L8 11.625"
          stroke="#1C274C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

interface IconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  filled = false,
  className,
}) => {
  const icon = IconsSVGObject.find(
    (icon) => icon.name === name,
  );

  if (!icon) {
    return null;
  }

  return (
    <div
      className={className}
      style={{ fill: filled ? "currentColor" : "none" }}
    >
      {icon.svg}
    </div>
  );
};

// Export each icon individually
const BookmarkIcon: React.FC<{
  filled?: boolean;
  className?: string;
}> = ({ filled, className }) => (
  <Icon
    name="Bookmark"
    filled={filled}
    className={className}
  />
);

const DownloadsIcon: React.FC<{
  filled?: boolean;
  className?: string;
}> = ({ filled, className }) => (
  <Icon
    name="Downloads"
    filled={filled}
    className={className}
  />
);

export { IconsSVGObject, BookmarkIcon, DownloadsIcon };
