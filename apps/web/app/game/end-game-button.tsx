import { Socket } from "socket.io-client";
import { useSocket } from "../socketContext";
import Link from "next/link";
import { Nullable } from "@repo/shared-types";

// TODO:
// - create modal to confirm if player wants to end the game
// - send alert to opponent, that game is over, send 'events' msg to reset

const endGame = (socket: Nullable<Socket>) => {
  if (socket) {
    socket.emit("gameEnded");
  }
};

export function EndsGameButton() {
  const { socket } = useSocket();
  return (
    <div className="flex flex-row p-[2px]">
      <Link
        href={{
          pathname: `/`,
        }}
        className="text-white bg-red-500 hover:bg-red-700 py-2 px-4 rounded"
        onClick={() => endGame(socket)}
      >
        End Game
      </Link>
    </div>
  );
}
