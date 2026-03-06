import { Socket } from "socket.io-client";
import { Square } from "./square";
import { WINNER } from "./page";
import { GameConnectionStates, Nullable } from "@repo/shared-types";

export function Board({
  squares,
  gameStatus,
  connectionState,
  playerChar,
  currentPlayer,
  room,
  socket,
}: {
  squares: ("" | "X" | "O")[];
  gameStatus: string;
  connectionState: GameConnectionStates;
  playerChar: string;
  currentPlayer: string;
  room: string;
  socket: Nullable<Socket>;
}) {
  const isWrongTurn = currentPlayer !== playerChar;

  const click = (index: number): void => {
    if (
      squares[index] ||
      gameStatus === WINNER ||
      connectionState !== "connected" ||
      isWrongTurn
    ) {
      return;
    } else {
      const squaresCopy: string[] = squares.slice();
      squaresCopy[index] = playerChar;

      // emit message
      if (socket) {
        socket.emit("broadcastGameEvent", {
          squares: squaresCopy,
          status: gameStatus,
          currentPlayer: playerChar === "X" ? "O" : "X",
          room,
        });
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square
          value={squares[0]!}
          onClickFn={() => click(0)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[1]!}
          onClickFn={() => click(1)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[2]!}
          onClickFn={() => click(2)}
          isWrongTurn={isWrongTurn}
        />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square
          value={squares[3]!}
          onClickFn={() => click(3)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[4]!}
          onClickFn={() => click(4)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[5]!}
          onClickFn={() => click(5)}
          isWrongTurn={isWrongTurn}
        />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square
          value={squares[6]!}
          onClickFn={() => click(6)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[7]!}
          onClickFn={() => click(7)}
          isWrongTurn={isWrongTurn}
        />
        <Square
          value={squares[8]!}
          onClickFn={() => click(8)}
          isWrongTurn={isWrongTurn}
        />
      </div>
    </div>
  );
}
