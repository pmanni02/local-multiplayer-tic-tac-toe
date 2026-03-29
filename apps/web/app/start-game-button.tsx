import Link from "next/link";

export function StartGameButton() {
  return <Link href={{ pathname: `/game` }}>Start</Link>;
}
