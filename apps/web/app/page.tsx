"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function Page() {
  const [rooms, setRooms] = useState<string[]>([]);

  // TODO:
  // - add state for storing rooms
  // - add dropdown for rooms
  // - add button to add room

  return (
    <>
      <div>
        <h1 className="text-3xl">Tic Tac Toe</h1>

        {/* GAME TYPE */}
        <details className="dropdown w-40">
          <summary className="flex flex-row btn-primary m-1 list-none bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded">
            Game Type
            <svg
              className="w-4 h-4 ms-1.5 -me-0.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </summary>
          <ul className="menu dropdown-content rounded-box z-1 p-2 shadow-sm">
            <Link className="" href="/game">
              <li>Regular</li>
            </Link>
          </ul>
        </details>

        {/* ROOM(S) */}
        <details className="dropdown w-40">
          <summary className="flex flex-row btn-primary m-1 list-none bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded">
            Room(s)
            <svg
              className="w-4 h-4 ms-1.5 -me-0.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </summary>
          <ul className="menu dropdown-content rounded-box z-1 p-2 shadow-sm">
            {
              rooms.map((room, index) => {
                return <li key={index}>{room}</li>
              })
            }
          </ul>
        </details>

        <div className="flex flex-col w-40">
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

              const roomsCopy = rooms.slice()
              if (!roomsCopy.includes(newRoom)) {
                const myRooms = [...rooms, newRoom]
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
    </>
  );
}
