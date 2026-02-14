'use client';
import { JSX, useEffect, useState } from "react";
import io, { Socket } from 'socket.io-client';

function Square({
  value,
  onClickFn
}: {
  value: 'X' | 'O',
  onClickFn: () => void
}): JSX.Element {
  const textStyles = {
    'X': 'text-red-500',
    'O': 'text-blue-500'
  }
  return (
    <div>
      <button
        className={`${textStyles[value]} font-bold p-0.5 w-25 h-25 bg-slate-500/50 hover:bg-slate-500/60 border border-slate-600/30 shadow-md`}
        onClick={onClickFn}
      >{value}</button>
    </div>
  )
}

export default function Board() {
  const [playerChar, setPlayerChar] = useState<'X' | 'O'>('X')
  const [squares, setSquares] = useState(Array(9).fill(''))
  const [gameStatus, setGameStatus] = useState("")

  const [socket, setSocket] = useState<null | Socket>()
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  // SOURCE: https://socket.io/how-to/use-with-nextjs
  useEffect(() => {
    const socket = io('http://localhost:3001');
    setSocket(socket)

    function onConnect() {
      if (socket) {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        socket.io.engine.on("upgrade", (transport) => {
          setTransport(transport.name);
        });

        console.log(`connection opened: ${socket.id}`);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");

      console.log(`socket disconnected`);
    }

    function onEvents(myObj: { index: number, char: string, senderSocketId: string }) {
      console.log(`curSocketId`, socket.id)
      console.log(`senderSocketId: ${myObj.senderSocketId}`)
      console.log(`Client received: ${JSON.stringify(myObj)}`)

      // only update frontend if message received was from another client
      if (socket.id && socket.id !== myObj.senderSocketId) {
        const squaresCopy: string[] = squares.slice();

        squaresCopy[myObj.index] = playerChar;
        console.log('squaresCopy', squaresCopy);

        setSquares(squaresCopy)
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("events", onEvents)

    return () => {
      // socket.off("connect", onConnect);
      // socket.off("disconnect", onDisconnect);
      // socket.off("events", onEvents)
      socket.disconnect()
    };
  }, []);

  const click = (index: number): void => {
    if (squares[index] || gameStatus !== "") {
      return
    }

    // emit message
    if (socket) {
      // socket.emit("events", index)
      socket.emit("events", { index, char: playerChar })
    }

    const squaresCopy: string[] = squares.slice()
    squaresCopy[index] = playerChar;
    setSquares(squaresCopy)

    if (gameWon(squaresCopy)) {
      setGameStatus('WINNER!')
    } else if (gameTie(squaresCopy)) {
      setGameStatus('TIE!')
    }

    if (playerChar === 'X') {
      setPlayerChar('O')
    } else {
      setPlayerChar('X')
    }
  }

  const gameTie = (squares: string[]) => {
    const emptySquares = squares.filter(val => val === "")
    if (emptySquares.length === 0) {
      return true
    }
    return false
  }

  const gameWon = (squares: string[]) => {
    // if values at 0,1,2 OR 3,4,5 OR 6,7,8 are all the same (rows)
    // if values at 0,3,6 OR 1,4,7 OR 2,5,8 are all the same (cols)
    // if values at 0,4,8 OR 2,4,6 are all the same (diagonals)
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]

    let gameOver = false;
    winConditions.forEach((winCondition) => {
      const [x, y, z] = winCondition;
      const validWinCondition =
        squares[x!] !== "" &&
        squares[x!] === squares[y!] &&
        squares[y!] === squares[z!]
      if (validWinCondition) {
        gameOver = true;
        return;
      }
    })
    return gameOver
  }

  const resetSquares = () => {
    const newSquares = Array(9).fill("")
    setSquares(newSquares)
    setGameStatus("")
  }

  return (
    <>
      <div className="p-40">
        <h2 className="flex justify-center text-xl">Tic Tac Toe</h2>
        <p className="flex justify-center text-black text-l font-bold h-8">{gameStatus}</p>
        <div className="flex flex-col">
          <div className="flex flex-row justify-center h-[103px] gap-[3px]">
            <Square value={squares[0]} onClickFn={() => click(0)} />
            <Square value={squares[1]} onClickFn={() => click(1)} />
            <Square value={squares[2]} onClickFn={() => click(2)} />
          </div>
          <div className="flex flex-row justify-center h-[103px] gap-[3px]">
            <Square value={squares[3]} onClickFn={() => click(3)} />
            <Square value={squares[4]} onClickFn={() => click(4)} />
            <Square value={squares[5]} onClickFn={() => click(5)} />
          </div>
          <div className="flex flex-row justify-center h-[103px] gap-[3px]">
            <Square value={squares[6]} onClickFn={() => click(6)} />
            <Square value={squares[7]} onClickFn={() => click(7)} />
            <Square value={squares[8]} onClickFn={() => click(8)} />
          </div>
        </div>
        <div className="flex flex-row justify-center p-[2px]">
          <button type="button" className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded" onClick={() => resetSquares()}>Reset</button>
        </div>
        <p className="flex justify-center">Connection: {isConnected ? "connected" : "disconnected"}</p>
        <p className="flex justify-center">Transport: {transport}</p>
      </div>
    </>
  )
}