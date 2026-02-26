function TextInfo({
  description,
  value,
  id,
}: {
  description: string;
  value: string;
  id: string;
}) {
  return (
    <>
      <p id={id} className="">
        <span id="key" className="text-md font-bold text-shadow-md">
          {description}:{" "}
        </span>
        {value}
      </p>
    </>
  );
}

export function GameInfo({
  playerChar,
  roomName,
  gameStatus,
}: {
  playerChar: string;
  roomName: string;
  gameStatus: string;
}) {
  return (
    <div className="flex justify-center gap-5 rounded-b-md text-black items-center text-m">
      <TextInfo description="Player" value={playerChar} id="player-char" />
      <TextInfo description="Room" value={roomName} id="game-room" />
      <TextInfo description="Turn" value={gameStatus} id="current-turn" />
    </div>
  );
}
