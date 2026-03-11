import { Tooltip } from "flowbite-react";

const msgToColor = {
  "Waiting for opponent": "text-light-orange",
  "Game Ready": "text-green-500/70",
  "Opponent Left Game": "text-lipstick-red",
  "Opponent Disconnected": "text-lipstick-red",
  Disconnected: "text-lipstick-red",
};

export function ConnectionStatus({
  connectionMessage,
  playerChar,
  currentPlayer,
}: {
  connectionMessage: string;
  playerChar: string;
  currentPlayer: string;
}) {
  const connectionColor: string =
    msgToColor[connectionMessage as keyof typeof msgToColor];
  return (
    <>
      <div className="flex flex-row group w-full justify-center gap-x-2 items-center">
        <p
          className={`flex ${connectionColor} font-bold lowercase tracking-wider`}
        >
          {connectionMessage}
        </p>
        <Tooltip
          content={`Player: ${playerChar} | Turn: ${currentPlayer}`}
          placement="right"
        >
          <svg
            className="w-4 h-4 text-white-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </Tooltip>
      </div>
    </>
  );
}
