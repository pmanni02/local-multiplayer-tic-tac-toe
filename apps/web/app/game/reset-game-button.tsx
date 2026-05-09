import { Socket } from "socket.io-client";
import { useSocketContext } from "../socketContext";
import { Nullable } from "@repo/shared-types";

// TODO:
// - create modal to confirm if user wants to reset
//  - if yes, popup modal for opponent for decision
//  - if both confirm, send reset board 'events' msg
//  - else, add create toast (or alert) for both players that game reset was aborted

const resetSquares = (socket: Nullable<Socket>, room: string, sessionId: Nullable<string>) => {
  if (socket) {
    socket.emit("gameEvent", {
      squares: Array(9).fill(""),
      status: "reset",
      currentPlayer: "X",
      room,
      sessionId,
    });
  }
};

export function ResetGameButton({ room }: { room: string }) {
  const { socket, sessionId } = useSocketContext();
  return (
    <button
      type="button"
      className="text-white bg-dark-orange py-2 px-4 rounded shadow-md"
      onClick={() => resetSquares(socket, room, sessionId)}
    >
      Reset
    </button>
  );
}
