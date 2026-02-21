import { Socket } from "socket.io-client";
import { Square } from "./square";
import { Nullable } from "../../global";
import { GAME_CONNECTION_STATES, WINNER } from "./page";

export function Board({
  squares,
  gameStatus,
  connectionState,
  playerChar,
  room,
  socket,
}: {
  squares: ("" | "X" | "O")[];
  gameStatus: string;
  connectionState: GAME_CONNECTION_STATES;
  playerChar: string;
  room: string;
  socket: Nullable<Socket>;
}) {
  const numNonEmptySquares = squares.filter((x) => x !== "").length;
  const isWrongTurn =
    (numNonEmptySquares % 2 === 0 && playerChar === "O") ||
    (numNonEmptySquares % 2 !== 0 && playerChar === "X");

  const click = (index: number): void => {
    if (squares[index] || gameStatus === WINNER || connectionState !== 'connected') {
      return;
    } else if (isWrongTurn) {
      return;
    }

    const squaresCopy: string[] = squares.slice();
    squaresCopy[index] = playerChar;

    // emit message
    if (socket) {
      socket.emit("events", {
        squares: squaresCopy,
        status: gameStatus,
        currentPlayer: playerChar === "X" ? "O" : "X",
        room,
      });
    }
  };

  return (
    <div className="flex flex-col bg-black">
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
