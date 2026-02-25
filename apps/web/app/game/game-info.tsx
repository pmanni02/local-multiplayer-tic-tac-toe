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
    <div className="flex justify-center gap-5 bg-black rounded-b-md">
      <div id="player-char">
        <p className="items-center text-white text-m">Player: {playerChar}</p>
      </div>
      <div id="game-room">
        <p className="items-center text-white text-m">Room: {roomName}</p>
      </div>
      <div id="current-turn">
        <p className="items-center text-white text-m">
          Current Turn: {gameStatus}
        </p>
      </div>
    </div>
  );
}
