"use client";
import React from "react";
import { StartGameButton } from "./start-game-button";
import { Tooltip } from "flowbite-react";

export default function Page() {
  return (
    <>
      <div className="flex flex-col justify-center content-center h-screen items-center bg-light-blue gap-y-5">
        <h1 className="flex text-7xl font-bold tracking-wide text-dark-blue text-shadow-md justify-center">
          TIC TAC TOE
        </h1>
        <div className="bg-dark-orange rounded font-normal text-black p-2 shadow-md">
          <StartGameButton />
        </div>
        <Tooltip className="" content={`Type: regular`} placement="bottom">
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="square"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h2m10 1a3 3 0 0 1-3 3m3-3a3 3 0 0 0-3-3m3 3h1m-4 3a3 3 0 0 1-3-3m3 3v1m-3-4a3 3 0 0 1 3-3m-3 3h-1m4-3v-1m-2.121 1.879-.707-.707m5.656 5.656-.707-.707m-4.242 0-.707.707m5.656-5.656-.707.707M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </Tooltip>
      </div>
    </>
  );
}
