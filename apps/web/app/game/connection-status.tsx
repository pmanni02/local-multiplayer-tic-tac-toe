import { GameConnectionStates } from "@repo/shared-types";

export function ConnectionStatus({
  connectionState,
  connectionMessage,
}: {
  connectionState: GameConnectionStates;
  connectionMessage: string;
}) {
  let connectionColor: string = "text-light-orange";
  if (connectionState === "connected") {
    connectionColor = "text-light-green";
  } else if (connectionState === "disconnected") {
    connectionColor = "text-lipstick-red";
  } else if (connectionState === "pendingGame") {
    connectionColor = "text-light-orange";
  }
  return (
    <>
      <div className="flex flex-row group w-full justify-center">
        <p className={`flex ${connectionColor} font-bold lowercase tracking-wide`}>
          {connectionMessage}
        </p>
      </div>
    </>
  );
}
