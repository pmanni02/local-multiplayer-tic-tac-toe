import { Socket } from "socket.io-client";
import { Nullable } from "../global";

const resetSquares = (socket: Socket) => {
  const newSquares = Array(9).fill("");
  if (socket) {
    socket.emit("events", {
      squares: newSquares,
      status: "",
    });
  }
};

export function ResetGame({ socket }: { socket: Nullable<Socket> }) {
  return (
    <div className="flex flex-row justify-center p-[2px]">
      <button
        type="button"
        className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
        onClick={() => resetSquares(socket!)}
      >
        Reset
      </button>
    </div>
  );
}
