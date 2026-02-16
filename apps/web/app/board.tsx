import { Socket } from "socket.io-client";
import { Square } from "./square";
import { Nullable } from "../global";

export function Board({
  squares,
  gameStatus,
  playerChar,
  socket,
}: {
  squares: ("X" | "O")[];
  gameStatus: string;
  playerChar: string;
  socket: Nullable<Socket>;
}) {
  const click = (index: number): void => {
    if (squares[index] || gameStatus !== "") {
      return;
    }

    // update board, emit to all clients
    const squaresCopy: string[] = squares.slice();
    squaresCopy[index] = playerChar;

    // emit message
    if (socket) {
      socket.emit("events", {
        squares: squaresCopy,
        status: gameStatus,
      });
    }
  };
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square value={squares[0]!} onClickFn={() => click(0)} />
        <Square value={squares[1]!} onClickFn={() => click(1)} />
        <Square value={squares[2]!} onClickFn={() => click(2)} />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square value={squares[3]!} onClickFn={() => click(3)} />
        <Square value={squares[4]!} onClickFn={() => click(4)} />
        <Square value={squares[5]!} onClickFn={() => click(5)} />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square value={squares[6]!} onClickFn={() => click(6)} />
        <Square value={squares[7]!} onClickFn={() => click(7)} />
        <Square value={squares[8]!} onClickFn={() => click(8)} />
      </div>
    </div>
  );
}
