import { useId } from "react";
import Select, { SingleValue } from 'react-select'
import { Nullable, ReactSelectOption,  } from "../global";

export function SelectDropDown({
  defaultOption,
  selectedOption,
  allOptions,
  handleOptionChange,
  classDescption,
}: {
  defaultOption?: Nullable<ReactSelectOption>
  selectedOption: Nullable<ReactSelectOption>,
  allOptions: ReactSelectOption[],
  handleOptionChange: (selectedOption: SingleValue<ReactSelectOption> | null) => void
  classDescption: string
}) {
  return (
    <div className={classDescption}>
      <Select
        defaultValue={defaultOption}
        value={selectedOption}
        options={allOptions}
        onChange={handleOptionChange}
        isClearable
        instanceId={useId()} // added to prevent hydration error
      />
    </div>
  )
}