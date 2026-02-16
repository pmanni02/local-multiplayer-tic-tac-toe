import { Square } from "./square";
export function Board({
  squares,
  squareClickFn
}: {
  squares: ("X" | "O")[];
  squareClickFn: (val: number) => void
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square value={squares[0]!} onClickFn={() => squareClickFn(0)} />
        <Square value={squares[1]!} onClickFn={() => squareClickFn(1)} />
        <Square value={squares[2]!} onClickFn={() => squareClickFn(2)} />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square value={squares[3]!} onClickFn={() => squareClickFn(3)} />
        <Square value={squares[4]!} onClickFn={() => squareClickFn(4)} />
        <Square value={squares[5]!} onClickFn={() => squareClickFn(5)} />
      </div>
      <div className="flex flex-row justify-center h-[103px] gap-[3px]">
        <Square value={squares[6]!} onClickFn={() => squareClickFn(6)} />
        <Square value={squares[7]!} onClickFn={() => squareClickFn(7)} />
        <Square value={squares[8]!} onClickFn={() => squareClickFn(8)} />
      </div>
    </div>
  )
}