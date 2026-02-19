export function GameInfo({
  playerChar,
  gameStatus,
}: {
  playerChar: string;
  gameStatus: string;
}) {
  return (
    <div className="flex justify-evenly pb-1 bg-black rounded-b-xs">
      <div>
        <p className="items-center text-white text-m">Player: {playerChar}</p>
      </div>
      <div>
        <p className="items-center text-white text-m">Current Turn: {gameStatus}</p>
      </div>
    </div>
  );
}
