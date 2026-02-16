"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Square } from "./square";

export default function Board() {
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [gameStatus, setGameStatus] = useState("");

  const [socket, setSocket] = useState<null | Socket>();
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    // connect to NestJS websocket server
    const socket = io("http://localhost:3001");

    function onConnect() {
      if (socket) {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);

        // upgrade connection to websocket
        socket.io.engine.on("upgrade", (transport) => {
          setTransport(transport.name);
        });

        console.log(`[CLIENT] - connection opened: ${socket.id}`);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");

      console.log(`socket disconnected`);
    }

    function onEvents(myObj: {
      squares: string[];
    }) {
      setSquares(myObj.squares);

      if (gameWon(myObj.squares)) {
        setGameStatus("WINNER!");
      } else if (gameTie(myObj.squares)) {
        setGameStatus("TIE!");
      }
    }

    function onSetup(myObj: {
      playerChar: string
    }) {
      console.log(`client player char: ${myObj.playerChar}`)
      if (myObj.playerChar === 'X' || myObj.playerChar === 'O') {
        setPlayerChar(myObj.playerChar)
      }
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("events", onEvents);
    socket.on("setup", onSetup);

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const click = (index: number): void => {
    if (squares[index] || gameStatus !== "") {
      return;
    }

    const squaresCopy: string[] = squares.slice();
    squaresCopy[index] = playerChar;

    // emit message
    if (socket) {
      socket.emit("events", {
        squares: squaresCopy,
      });
    }
  };

  const gameTie = (squares: string[]) => {
    const emptySquares = squares.filter((val) => val === "");
    if (emptySquares.length === 0) {
      return true;
    }
    return false;
  };

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
      [2, 4, 6],
    ];

    let gameOver = false;
    winConditions.forEach((winCondition) => {
      const [x, y, z] = winCondition;
      const validWinCondition =
        squares[x!] !== "" &&
        squares[x!] === squares[y!] &&
        squares[y!] === squares[z!];
      if (validWinCondition) {
        gameOver = true;
        return;
      }
    });
    return gameOver;
  };

  const resetSquares = () => {
    const newSquares = Array(9).fill("");
    setSquares(newSquares);
    setGameStatus("");
  };

  return (
    <>
      <div className="p-40">
        <h2 className="flex justify-center text-xl">Tic Tac Toe</h2>
        <p className="flex justify-center text-black text-l font-bold h-8">
          {gameStatus}
        </p>
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
          <button
            type="button"
            className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded"
            onClick={() => resetSquares()}
          >
            Reset
          </button>
        </div>
        <p className="flex justify-center">
          Connection: {isConnected ? "connected" : "disconnected"}
        </p>
        <p className="flex justify-center">Transport: {transport}</p>
      </div>
    </>
  );
}
