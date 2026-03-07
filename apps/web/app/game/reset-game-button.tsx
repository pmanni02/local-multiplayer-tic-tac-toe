import { Socket } from "socket.io-client";
import { useSocket } from "../socketContext";
import { Nullable } from "@repo/shared-types";

// TODO:
// - create modal to confirm if user wants to reset
//  - if yes, popup modal for opponent for decision
//  - if both confirm, send reset board 'events' msg
//  - else, add create toast (or alert) for both players that game reset was aborted

const resetSquares = (socket: Nullable<Socket>, roomName: string) => {
  const newSquares = Array(9).fill("");
  if (socket) {
    socket.emit("gameEvent", {
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
    <button
      type="button"
      className="text-white bg-dark-orange py-2 px-4 rounded shadow-md"
      onClick={() => resetSquares(socket, roomName)}
    >
      Reset
    </button>
  );
}
