import { Socket } from "socket.io-client";
import { Nullable } from "../../global";
import { useSocket } from "../socketContext";
import Link from "next/link";

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
