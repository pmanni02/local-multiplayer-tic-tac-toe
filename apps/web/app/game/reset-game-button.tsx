import { Socket } from "socket.io-client";
import { useSocket } from "../socketContext";
import { Nullable } from "@repo/shared-types";

// TODO: 
// - add toast to confirm if player wants to reset
//  - if yes, add toast to ask opponent for confirmation as well
//  - if both confirm, send reset board
//  - else, add alert for aborted game reset

const resetSquares = (socket: Nullable<Socket>, roomName: string) => {
  const newSquares = Array(9).fill("");
  if (socket) {
    socket.emit("events", {
      squares: newSquares,
      status: "",
      currentPlayer: "X",
      room: roomName,
    });
  }
};

export function ResetGameButton() {
  const { socket, roomName } = useSocket();
  return (
    <div className="flex flex-row p-[2px]">
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
