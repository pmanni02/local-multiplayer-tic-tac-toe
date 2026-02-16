import { JSX } from "react";

export function Square({
  value,
  onClickFn,
}: {
  value: "X" | "O" | "";
  onClickFn: () => void;
}): JSX.Element {
  const textStyles = {
    X: "text-red-500",
    O: "text-blue-500",
  };
  const color = value ? textStyles[value] : "";
  return (
    <div>
      <button
        className={`${color} font-bold p-0.5 w-25 h-25 bg-slate-500/50 hover:bg-slate-500/60 border border-slate-600/30 shadow-md rounded-sm`}
        onClick={onClickFn}
      >
        {value}
      </button>
    </div>
  );
}
