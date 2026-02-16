export function ConnectionStatus({ isConnected }: { isConnected: boolean }) {
  let connectionStyle: string;
  if (isConnected) {
    connectionStyle = "bg-green-500";
  } else {
    connectionStyle = "bg-red-500";
  }
  return (
    <>
      <span
        className={`flex w-3 h-3 ${connectionStyle} rounded-full me-1.5 ml-2.5 mt-2`}
      ></span>
    </>
  );
}
