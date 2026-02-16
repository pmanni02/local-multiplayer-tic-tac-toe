export function GameInfo({ playerChar, gameStatus }: { playerChar: string, gameStatus: string }) {
  return (
    <div className="flex justify-evenly pb-1 bg-black">
      <div>
        <p className="items-center text-white text-m">
          Player: {playerChar}
        </p>
      </div>
      <div>
        <p className="items-center text-white text-m">{gameStatus}</p>
      </div>
    </div>
  )
}