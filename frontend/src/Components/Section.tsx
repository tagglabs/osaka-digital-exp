import { Input } from "./Input";
import { Button } from "./Button";
import { forwardRef } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

export type Section = {
  title: string;
  titleJap: string;
  content: string;
  contentJap: string;
};

interface SectionProps {
  sections: Section[];
  activeSection: number;
  onChange: (
    index: number,
    title: string,
    content: string,
    titleJap?: string,
    contentJap?: string,
  ) => void;
  onAdd: () => void;
  error?: string;
  language: "en" | "jp";
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
      language,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className="w-full flex flex-col gap-4"
        ref={ref}
        {...props}
      >
        {error && (
          <div className="w-full bg-red-50 border-l-4 border-red-500 p-4 mb-2">
            <div className="flex items-center">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        <div className="w-full flex gap-10">
          <div className="w-1/2 flex flex-col gap-2">
            {/* English Inputs */}
            <div
              style={{
                display:
                  language === "en" ? "block" : "none",
              }}
            >
              <Input
                label="Enter section title (English) *"
                placeholder="Enter section title"
                value={sections[activeSection]?.title || ""}
                onChange={(e) =>
                  onChange(
                    activeSection,
                    e.target.value,
                    sections[activeSection]?.content || "",
                    sections[activeSection]?.titleJap,
                    sections[activeSection]?.contentJap,
                  )
                }
                error={error}
              />
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-[12px] text-gray-primary uppercase">
                  Enter section content (English){" "}
                  <span className="text-red-500">*</span>
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
                  value={
                    sections[activeSection]?.content || ""
                  }
                  onChange={(e) =>
                    onChange(
                      activeSection,
                      sections[activeSection]?.title || "",
                      e.target.value,
                      sections[activeSection]?.titleJap,
                      sections[activeSection]?.contentJap,
                    )
                  }
                />
              </div>
            </div>

            {/* Japanese Inputs */}
            <div
              style={{
                display:
                  language === "jp" ? "block" : "none",
              }}
            >
              <Input
                label="Enter section title (Japanese)"
                placeholder="タイトルを入力"
                value={
                  sections[activeSection]?.titleJap || ""
                }
                onChange={(e) =>
                  onChange(
                    activeSection,
                    sections[activeSection]?.title || "",
                    sections[activeSection]?.content || "",
                    e.target.value,
                    sections[activeSection]?.contentJap,
                  )
                }
                error={error}
              />
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-[12px] text-gray-primary uppercase">
                  Enter section content (Japanese){" "}
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
                  placeholder="内容を入力"
                  rows={8}
                  value={
                    sections[activeSection]?.contentJap ||
                    ""
                  }
                  onChange={(e) =>
                    onChange(
                      activeSection,
                      sections[activeSection]?.title || "",
                      sections[activeSection]?.content ||
                        "",
                      sections[activeSection]?.titleJap,
                      e.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>

          <div className="w-1/2 h-full pt-6 flex flex-col gap-1">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() =>
                  onChange(
                    index,
                    section.title,
                    section.content,
                    section.titleJap,
                    section.contentJap,
                  )
                }
                type="button"
                className={`w-full rounded-md py-2 px-2 text-left flex items-center justify-between ${
                  activeSection === index
                    ? "border-2 border-gray-primary font-bold text-black"
                    : section.title && section.content
                    ? "bg-gray-secondary text-gray-primary"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <span className="flex-1">
                  {language === "en"
                    ? section.title || "Untitled"
                    : section.titleJap || "無題"}
                </span>
                {(!section.title || !section.content) && (
                  <div className="flex items-center text-red-500">
                    <ExclamationCircleIcon className="h-5 w-5 mr-1" />
                    <span className="text-xs">
                      Incomplete
                    </span>
                  </div>
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
      </div>
    );
  },
);

Section.displayName = "Section";
