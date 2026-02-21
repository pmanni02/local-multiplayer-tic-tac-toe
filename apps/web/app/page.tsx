"use client";
import React, { useState } from "react";
import { SingleValue } from "react-select";
import { StartGameButton } from "./start-game-button";
import { ReactSelectOption } from "../global";
import { SelectDropDown } from "./select-dropdown";
import { useSocket } from "./socketContext";

// TODO: style page

const gameTypeOptions: ReactSelectOption[] = [
  { value: "regular", label: "regular" },
  { value: "ultimate", label: "ultimate" },
];

const defaultGameTypeOption: ReactSelectOption = {
  value: "regular",
  label: "regular",
};

export default function Page() {
  const { roomName } = useSocket();

  const [selectedGameTypeOption, setSelectedGameTypeOption] =
    useState<ReactSelectOption>(defaultGameTypeOption);

  const handleGameTypeChange = (
    selectedOption: SingleValue<ReactSelectOption> | null,
  ) => {
    if (selectedOption) {
      setSelectedGameTypeOption(selectedOption);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-120 h-60 p-5 m-5 bg-gray-500 rounded-md">
        <h1 className="flex text-3xl justify-center">Tic Tac Toe</h1>
        <div className="flex flex-row justify-center gap-1">
          <SelectDropDown
            defaultValue={defaultGameTypeOption}
            selectedOption={selectedGameTypeOption}
            allOptions={gameTypeOptions}
            handleOptionChange={handleGameTypeChange}
          />
          <StartGameButton
            roomName={roomName}
            gameType={selectedGameTypeOption?.value}
          />
        </div>
      </div>
    </>
  );
}
