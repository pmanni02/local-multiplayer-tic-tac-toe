"use client";
import React, { useId, useState } from "react";
import Select, { SingleValue } from 'react-select'
import { StartGameButton } from "./start-game-button";

interface OptionType {
  value: string;
  label: string;
}

const gameTypeOptions: OptionType[] = [
  { value: 'regular', label: 'regular' },
  { value: 'ultimate', label: 'ultimate' }
]

export default function Page() {
  const [rooms, setRooms] = useState<string[]>([]);

  const [roomOptions, setRoomOptions] = useState<OptionType[]>([])
  const [selectedRoomOption, setSelectedRoomOption] = useState<OptionType>()
  const [selectedGameTypeOption, setSelectedGameTypeOption] = useState<OptionType>()

  const handleGameTypeChange = (selectedOption: SingleValue<OptionType> | null) => {
    if (selectedOption) {
      setSelectedGameTypeOption(selectedOption)
    }
  }

  const handleRoomNameChange = (selectedOption: SingleValue<OptionType> | null) => {
    if (selectedOption) {
      setSelectedRoomOption(selectedOption)
    }
  }

  return (
    <>
      <h1 className="text-3xl">Tic Tac Toe</h1>
      <div className="flex flex-col w-120">
        {/* SELECT MENUS */}
        <div className="flex flex-row gap-y-4">
          {/* GAME TYPE */}
          <div className="">
            <Select
              value={selectedGameTypeOption}
              options={gameTypeOptions}
              onChange={handleGameTypeChange}
              isClearable
              instanceId={useId()} // added to prevent hydration error
            />
          </div>

          {/* ROOM(S) */}
          <div className="">
            <Select
              value={selectedRoomOption}
              options={roomOptions}
              onChange={handleRoomNameChange}
              isClearable
              instanceId={useId()} // added to prevent hydration error
            />
          </div>

          {/* ADD NEW ROOM */}
          <div className="flex flex-col">
            <form
              className="flex flex-col"
              id="roomInput"
              onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as typeof e.target & {
                  addRoom: { value: string }
                };
                const newRoom = target.addRoom.value;
                console.log('newRoom', newRoom)

                const roomOptionsCopy = roomOptions.slice()
                roomOptionsCopy.push({ value: `${newRoom}`, label: `${newRoom}` })

                const roomsCopy = rooms.slice()
                if (!roomsCopy.includes(newRoom)) {
                  const myRooms = [...rooms, newRoom]
                  setRoomOptions(roomOptionsCopy);
                  setRooms(myRooms)
                }

                const form = document.getElementById('roomInput') as HTMLFormElement
                form.reset()
              }}>
              <input
                name="addRoom"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Add room name..."
              />
              <p className="flex label text-xs justify-end-safe text-slate-500/50">Press Enter</p>
            </form>
          </div>
        </div>

        <StartGameButton gameType={selectedGameTypeOption?.value} roomName={selectedRoomOption?.value} />
      </div>
    </>
  );
}
