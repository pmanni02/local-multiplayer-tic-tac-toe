import Link from "next/link";
import { Nullable } from "../global";

export function StartGameButton({
  gameType,
  roomName,
}: {
  gameType: Nullable<string>;
  roomName: Nullable<string>;
}) {
  if (gameType && roomName) {
    return (
      <div className="flex flex-row">
        <Link
          href={{
            pathname: `/game`,
            query: { room: roomName, type: gameType },
          }}
          className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
        >
          Start!
        </Link>
      </div>
    );
  } else {
    return <></>;
  }
}
