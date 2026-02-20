"use client";
import React, { useState } from "react";
import { SingleValue } from 'react-select'
import { StartGameButton } from "./start-game-button";
import { ReactSelectOption } from "../global";
import { SelectDropDown } from "./select-dropdown";

// TODO: style page

const gameTypeOptions: ReactSelectOption[] = [
  { value: 'regular', label: 'regular' },
  { value: 'ultimate', label: 'ultimate' }
]

const defaultGameTypeOption: ReactSelectOption = { value: 'regular', label: 'regular' }

export default function Page() {
  const [selectedGameTypeOption, setSelectedGameTypeOption] = useState<ReactSelectOption>(defaultGameTypeOption)

  const handleGameTypeChange = (selectedOption: SingleValue<ReactSelectOption> | null) => {
    if (selectedOption) {
      setSelectedGameTypeOption(selectedOption)
    }
  }

  return (
    <>
      <h1 className="text-3xl">Tic Tac Toe</h1>
      <div className="flex flex-col w-120">
        <div className="flex flex-row gap-y-4">
          <SelectDropDown
            defaultValue={defaultGameTypeOption}
            selectedOption={selectedGameTypeOption}
            allOptions={gameTypeOptions}
            handleOptionChange={handleGameTypeChange}
            classDescption=""
          />
          <StartGameButton gameType={selectedGameTypeOption?.value} />
        </div>
      </div>
    </>
  );
}
