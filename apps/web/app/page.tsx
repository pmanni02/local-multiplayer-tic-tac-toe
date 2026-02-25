"use client";
import React, { useState } from "react";
import { SingleValue } from "react-select";
import { StartGameButton } from "./start-game-button";
import { ReactSelectOption } from "../global";
import { SelectDropDown } from "./select-dropdown";
import { useSocket } from "./socketContext";

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
      {/* flex justify-center content-center h-screen items-center */}
      <div className="flex flex-col justify-center content-center h-screen items-center bg-light-blue">
        <h1 className="flex text-7xl font-bold tracking-wide text-dark-blue text-shadow-md justify-center pb-5">
          TIC TAC TOE
          {/* TODO: enable connection indicator */}
          {/* <span
          className={`w-3 h-3 bg-${connectionColor} rounded-full me-1.5 ml-2.5 mt-2`}
        ></span> */}
        </h1>
        <div className="flex flex-row justify-center gap-3 pt-5">
          <div className="text-shadow-md">
            <SelectDropDown
              defaultValue={defaultGameTypeOption}
              selectedOption={selectedGameTypeOption}
              allOptions={gameTypeOptions}
              handleOptionChange={handleGameTypeChange}
            />
          </div>
          <div className="text-shadow-md">
            <StartGameButton
              roomName={roomName}
              gameType={selectedGameTypeOption?.value}
            />
          </div>

        </div>
        <p className="flex justify-center pt-3">
          <span className="text-md font-bold text-shadow-md">ROOM: </span>{roomName}
        </p>
      </div>
    </>
  );
}
