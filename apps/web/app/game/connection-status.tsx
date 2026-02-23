import { GameConnectionStates } from "@repo/shared-types";

export function ConnectionStatus({
  connectionState,
  connectionMessage,
}: {
  connectionState: GameConnectionStates;
  connectionMessage: string;
}) {
  let connectionColor: string = "";
  if (connectionState === "connected") {
    connectionColor = "bg-green-500";
  } else if (connectionState === "disconnected") {
    connectionColor = "bg-red-500";
  } else if (connectionState === "pendingGame") {
    connectionColor = "bg-orange-500";
  }
  return (
    <>
      <div className="flex flex-row group w-50">
        <span
          className={`w-3 h-3 ${connectionColor} rounded-full me-1.5 ml-2.5 mt-2`}
        ></span>

        <p className="text-black hidden group-hover:block text-sm text-white">
          {connectionMessage}
        </p>
      </div>
    </>
  );
}
