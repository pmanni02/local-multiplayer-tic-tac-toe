import { JSX } from "react";

export function Square({
  value,
  isWrongTurn,
  onClickFn,
}: {
  value: "X" | "O" | "";
  isWrongTurn: boolean;
  onClickFn: () => void;
}): JSX.Element {
  const textStyles = {
    X: "text-red-500",
    O: "text-blue-500",
  };
  const color = value ? textStyles[value] : "";
  const transitionStyle = isWrongTurn ? `transition-colors delay-175 duration-100 ease-in hover:border-red-600/30` : ""
  return (
    <div>
      <button
        className={`${color} font-bold p-0.5 w-25 h-25 bg-slate-500/50 border border-slate-600/30 ${transitionStyle} hover:bg-slate-500/60 shadow-md rounded-sm`}
        onClick={onClickFn}
      >
        {value}
      </button>
    </div>
  );
}
