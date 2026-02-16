"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { ConnectionStatus } from "./connection-status";
import { Board } from "./board";
import { gameTie, gameWon } from "./game-utils";
import { ResetGame } from "./game-actions";

export default function Game() {
  const [socket, setSocket] = useState<null | Socket>();

  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [gameStatus, setGameStatus] = useState("");
  // const [isPlayerTurn, setIsPlayerTurn] = useState(false);

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // connect to NestJS websocket server
    const socket = io("http://localhost:3001");

    function onConnect() {
      if (socket) {
        setIsConnected(true);

        // TEMP
        socket.io.engine.on("upgrade", (transport) => {
          console.log(`upgraded to: ${transport.name}`);
        });

        console.log(`[CONNECT]: ${socket.id}`);
      }
    }

    function onSetup(myObj: { playerChar: string }) {
      console.log(`client player char: ${myObj.playerChar}`);
      if (myObj.playerChar === "X" || myObj.playerChar === "O") {
        setPlayerChar(myObj.playerChar);
        // if(myObj.playerChar === 'X') {
        //   setIsPlayerTurn(true);
        // }
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log(`[DISCONNECT]`);
    }

    function onEvents(myObj: { squares: string[]; status: string }) {
      setSquares(myObj.squares);
      setGameStatus(myObj.status);

      if (gameWon(myObj.squares)) {
        setGameStatus("WINNER!");
      } else if (gameTie(myObj.squares)) {
        setGameStatus("TIE!");
      }
    }

    socket.on("connect", onConnect);
    socket.on("setup", onSetup);
    socket.on("disconnect", onDisconnect);
    socket.on("events", onEvents);

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div className="p-40">
        <span className="flex justify-center text-xl text-heading me-3">
          Tic Tac Toe
          <ConnectionStatus isConnected={isConnected} />
        </span>
        <p className="flex justify-center text-black text-l font-bold h-8">
          {gameStatus}
        </p>
        <Board
          squares={squares}
          gameStatus={gameStatus}
          playerChar={playerChar}
          socket={socket}
        />
        <ResetGame socket={socket} />
      </div>
    </>
  );
}
