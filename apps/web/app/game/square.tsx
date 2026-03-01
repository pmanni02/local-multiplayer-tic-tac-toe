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
  const transitionStyle = isWrongTurn
    ? `transition-colors delay-125 duration-100 ease-in hover:border-red-500/70 border-3`
    : "transition-colors delay-125 duration-100 ease-in hover:border-green-500/70 border-3";
  return (
    <div>
      <button
        className={`${color} font-bold text-2xl p-0.5 w-25 h-25 shadow-md bg-dark-blue border border-slate-600/30 ${transitionStyle} hover:shadow-md rounded-lg`}
        onClick={onClickFn}
      >
        {value}
      </button>
    </div>
  );
}
