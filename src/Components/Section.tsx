import { Input } from "./Input";

export const Section = () => {
  return (
    <div className="w-full flex gap-10 ">
      <div className="w-1/2 flex flex-col gap-2">
        <Input
          label="Enter section title"
          placeholder="Enter"
        />
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-gray-primary uppercase">
            Enter section content
          </label>
          <textarea
            className="w-full border-2 border-gray-primary rounded-md py-1 px-2"
            placeholder="Enter"
            rows={8}
          />
        </div>
      </div>
      <div className="w-1/2 h-full pt-6 flex flex-col gap-1">
        <button className="w-full border-2 border-gray-primary rounded-md py-2 px-2 font-bold">
          Overview
        </button>
        <button className="w-full rounded-md py-2 px-2 bg-gray-secondary text-gray-primary">
          Historical Significance
        </button>
        <button className="w-full rounded-md py-2 px-2 bg-gray-secondary text-gray-primary">
          Condition & Conservation
        </button>
        <button className="w-full rounded-md py-2 px-2 bg-gray-secondary text-gray-primary">
          References
        </button>
      </div>
    </div>
  );
};
