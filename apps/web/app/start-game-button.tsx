import { Nullable } from "@repo/shared-types";
import Link from "next/link";

export function StartGameButton({
  gameType,
  roomName,
}: {
  gameType: Nullable<string>;
  roomName: Nullable<string>;
}) {
  return (
    <Link
      href={{ pathname: `/game`, query: { room: roomName, type: gameType } }}
    >
      Start
    </Link>
  );
}
