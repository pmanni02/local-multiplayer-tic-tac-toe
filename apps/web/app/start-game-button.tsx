import Link from "next/link";
import { Nullable } from "../global";

export function StartGameButton({ gameType }: { gameType: Nullable<string> }) {
  if (gameType) {
    return (
      <div className="flex flex-row p-[2px]">
        <Link
          href={{ pathname: `/game`, query: { type: gameType } }}
          className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
        >
          Start!
        </Link>
      </div>
    )
  } else {
    return (
      <></>
    )
  }
}