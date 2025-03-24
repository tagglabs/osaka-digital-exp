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
  {
    name: "Menu",
    svg: (
      <svg
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 18L20 18"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 12L20 12"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M4 6L20 6"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Back",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="60%"
        height="60%"
        viewBox="0 0 50 50"
        fill="#000000"
      >
        <path d="M 34.960938 2.980469 C 34.441406 2.996094 33.949219 3.214844 33.585938 3.585938 L 13.585938 23.585938 C 12.804688 24.367188 12.804688 25.632813 13.585938 26.414063 L 33.585938 46.414063 C 34.085938 46.9375 34.832031 47.148438 35.535156 46.964844 C 36.234375 46.78125 36.78125 46.234375 36.964844 45.535156 C 37.148438 44.832031 36.9375 44.085938 36.414063 43.585938 L 17.828125 25 L 36.414063 6.414063 C 37.003906 5.839844 37.183594 4.960938 36.863281 4.199219 C 36.539063 3.441406 35.785156 2.957031 34.960938 2.980469 Z"></path>
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

const MenuIcon: React.FC<{
  filled?: boolean;
  className?: string;
}> = ({ filled, className }) => (
  <Icon name="Menu" filled={filled} className={className} />
);

const BackIcon: React.FC<{
  filled?: boolean;
  className?: string;
}> = ({ filled, className }) => (
  <Icon name="Back" filled={filled} className={className} />
);

export {
  IconsSVGObject,
  BookmarkIcon,
  DownloadsIcon,
  MenuIcon,
  BackIcon,
};
