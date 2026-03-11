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
      <p id={id}>
        <span id="key" className="text-md font-bold text-shadow-md">
          {description}:{" "}
        </span>
        {value}
      </p>
    </>
  );
}

export function GameInfo({ roomName }: { roomName: string }) {
  return <TextInfo description="Room" value={roomName} id="game-room" />;
}
