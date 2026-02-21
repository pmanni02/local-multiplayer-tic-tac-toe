import { Socket } from "socket.io-client";
import { Nullable } from "../../global";
import { useSocket } from "../socketContext";

const resetSquares = (socket: Nullable<Socket>, roomName: string) => {
  const newSquares = Array(9).fill("");
  if (socket) {
    socket.emit("events", {
      squares: newSquares,
      status: "",
      currentPlayer: "X",
      room: roomName
    });
  }
};

export function ResetGameButton({ roomName }: { roomName: string }) {
  const socket = useSocket();
  return (
    <div className="flex flex-row justify-center p-[2px]">
      <button
        type="button"
        className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
        onClick={() => resetSquares(socket, roomName)}
      >
        Reset
      </button>
    </div>
  );
}
