import { useId } from "react";
import Select, { SingleValue } from "react-select";
import { Nullable, ReactSelectOption } from "../global";

export function SelectDropDown({
  defaultValue,
  selectedOption,
  allOptions,
  handleOptionChange,
}: {
  defaultValue?: Nullable<ReactSelectOption>;
  selectedOption: Nullable<ReactSelectOption>;
  allOptions: ReactSelectOption[];
  handleOptionChange: (
    selectedOption: SingleValue<ReactSelectOption> | null,
  ) => void;
}) {
  return (
    <>
      <Select
        defaultValue={defaultValue}
        value={selectedOption}
        options={allOptions}
        onChange={handleOptionChange}
        isClearable
        instanceId={useId()} // added to prevent hydration error
      />
    </>
  );
}
