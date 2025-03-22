import { Input } from "./Input";
import { Button } from "./Button";
import { forwardRef } from "react";

export type Section = {
  title: string;
  content: string;
};

interface SectionProps {
  sections: Section[];
  activeSection: number;
  onChange: (
    index: number,
    title: string,
    content: string,
  ) => void;
  onAdd: () => void;
  error?: string;
}

export const Section = forwardRef<
  HTMLDivElement,
  SectionProps
>(
  (
    {
      sections,
      activeSection,
      onChange,
      onAdd,
      error,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className="w-full flex gap-10"
        ref={ref}
        {...props}
      >
        <div className="w-1/2 flex flex-col gap-2">
          <Input
            label="Enter section title *"
            placeholder="Enter section title"
            value={sections[activeSection]?.title || ""}
            onChange={(e) =>
              onChange(
                activeSection,
                e.target.value,
                sections[activeSection]?.content || "",
              )
            }
            error={error}
          />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] text-gray-primary uppercase">
              Enter section content *
              {error && (
                <span className="text-xs text-red-500 ml-1">
                  ({error})
                </span>
              )}
            </label>
            <textarea
              className={`w-full border-2 ${
                error
                  ? "border-red-500"
                  : "border-gray-primary"
              } rounded-md py-1 px-2 min-h-[120px]`}
              placeholder="Enter section content"
              rows={8}
              value={sections[activeSection]?.content || ""}
              onChange={(e) =>
                onChange(
                  activeSection,
                  sections[activeSection]?.title || "",
                  e.target.value,
                )
              }
            />
          </div>
        </div>
        <div className="w-1/2 h-full pt-6 flex flex-col gap-1">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() =>
                onChange(
                  index,
                  sections[index].title,
                  sections[index].content,
                )
              }
              type="button"
              className={`w-full rounded-md py-2 px-2 text-left ${
                activeSection === index
                  ? "border-2 border-gray-primary font-bold text-black"
                  : section.title && section.content
                  ? "bg-gray-secondary text-gray-primary"
                  : "bg-gray-secondary text-red-500"
              }`}
            >
              {section.title || "Untitled"}
              {(!section.title || !section.content) && (
                <span className="text-xs text-red-500 ml-2">
                  (incomplete)
                </span>
              )}
            </button>
          ))}
          <div className="mt-2">
            <Button
              placeholder="Add New Section"
              onClick={onAdd}
              type="button"
            />
          </div>
        </div>
      </div>
    );
  },
);

Section.displayName = "Section";
