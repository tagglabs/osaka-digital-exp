import { Input } from "./Input";
import { forwardRef } from "react";

export type SubSection = {
  title: string;
  content: string;
};

export type SectionData = {
  overview: SubSection;
  historicalSignificance: SubSection;
  conditionConservation: SubSection;
  references: SubSection;
};

type SubSectionType = keyof SectionData;

const SECTION_TABS: SubSectionType[] = [
  "overview",
  "historicalSignificance",
  "conditionConservation",
  "references"
];

const SECTION_TAB_LABELS: Record<SubSectionType, string> = {
  overview: "Overview",
  historicalSignificance: "Historical Significance",
  conditionConservation: "Condition & Conservation",
  references: "References"
};

interface SectionProps {
  index: number;
  isActive?: boolean;
  activeSubSection: SubSectionType;
  sectionData: SectionData;
  onTabClick?: () => void;
  onSubSectionClick: (subSection: SubSectionType) => void;
  onChange: (title: string, content: string) => void;
  error?: string;
}

export const Section = forwardRef<HTMLDivElement, SectionProps>(({
  isActive = false,
  activeSubSection,
  sectionData,
  onTabClick,
  onSubSectionClick,
  onChange,
  error,
  ...props
}, ref) => {
  const currentSubSection = sectionData[activeSubSection];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, currentSubSection.content);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(currentSubSection.title, e.target.value);
  };

  return (
    <div className="w-full flex gap-10" ref={ref} {...props}>
      <div className="w-1/2 flex flex-col gap-2">
        <Input
          label="Enter section title"
          placeholder="Enter"
          value={currentSubSection.title}
          onChange={handleTitleChange}
          error={error}
        />
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-primary uppercase">
            Enter section content
          </label>
          <textarea
            className={`w-full border-2 ${
              error ? "border-red-500" : "border-gray-primary"
            } rounded-md py-1 px-2`}
            placeholder="Enter"
            rows={8}
            value={currentSubSection.content}
            onChange={handleContentChange}
          />
          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>
      </div>
      <div className="w-1/2 h-full pt-6 flex flex-col gap-1">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onSubSectionClick(tab)}
            type="button"
            className={`w-full rounded-md py-2 px-2 ${
              activeSubSection === tab 
                ? "border-2 border-gray-primary font-bold text-black" 
                : "bg-gray-secondary text-gray-primary"
            }`}
          >
            {SECTION_TAB_LABELS[tab]}
          </button>
        ))}
      </div>
    </div>
  );
});
