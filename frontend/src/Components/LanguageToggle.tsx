import React from "react";

interface LanguageToggleProps {
  language: "en" | "jp";
  onToggle: () => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  language,
  onToggle,
}) => {
  return (
    <div className="fixed top-4 right-8 z-50 bg-white shadow-md rounded-md">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none rounded-md"
      >
        <span
          className={
            language === "en"
              ? "text-blue-600 font-bold"
              : "text-gray-500"
          }
        >
          EN
        </span>
        <span className="text-gray-400">/</span>
        <span
          className={
            language === "jp"
              ? "text-blue-600 font-bold"
              : "text-gray-500"
          }
        >
          JP
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;
