import { useId } from "react";
import Select, { SingleValue } from 'react-select'
import { Nullable, OptionType } from "../global";

export function SelectDropDown({
  defaultOption,
  selectedOption,
  allOptions,
  handleOptionChange,
  classDescption,
}: {
  defaultOption?: Nullable<OptionType>
  selectedOption: Nullable<OptionType>,
  allOptions: OptionType[],
  handleOptionChange: (selectedOption: SingleValue<OptionType> | null) => void
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