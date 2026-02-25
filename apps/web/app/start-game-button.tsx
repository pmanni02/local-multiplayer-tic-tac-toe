import { Nullable } from "@repo/shared-types";
import Link from "next/link";

export function StartGameButton({
  gameType,
  roomName,
}: {
  gameType: Nullable<string>;
  roomName: Nullable<string>;
}) {
  if (gameType && roomName) {
    return (
      <div className="flex items-center h-full bg-dark-orange rounded font-normal text-white px-2 hover:font-semibold">
        <Link
          href={{
            pathname: `/game`,
            query: { room: roomName, type: gameType },
          }}
        >
          Start!
        </Link>
      </div>
    );
  } else {
    return <></>;
  }
}
