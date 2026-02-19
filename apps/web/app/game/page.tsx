"use client";
import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { ConnectionStatus } from "./connection-status";
import { gameTie, gameWon } from "../game-utils";
import { ResetGame } from "./game-actions";
import { Board } from "./board";
import { GameInfo } from "./game-info";

export const WINNER = "WINNER!";
export const TIE = "TIE!";

export default function Game() {
  const [socket, setSocket] = useState<null | Socket>();
  const [isConnected, setIsConnected] = useState(false);

  const [squares, setSquares] = useState(Array(9).fill(""));
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  // const [gameEvents, setGameEvents] = useState<{ squares: string[]; status: string; }[]>([])
  const [gameStatus, setGameStatus] = useState("");

  useEffect(() => {
    // connect to NestJS websocket server
    const socket = io("http://localhost:3001");

    function onConnect() {
      if (socket) {
        setIsConnected(true);
        console.log(`[CONNECT]: ${socket.id}`);
      }
    }

    function onSetup(myObj: { playerChar: string; isPlayerTurn: boolean }) {
      console.log(`[SETUP]: player char: ${myObj.playerChar}`);
      if (myObj.playerChar === "X" || myObj.playerChar === "O") {
        setPlayerChar(myObj.playerChar);

        // default first player to client with 'X' playerChar
        setGameStatus(`X`);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
      console.log(`[DISCONNECT]`);
    }

    function onEvents(myObj: {
      squares: string[];
      status: string;
      currentPlayer: string;
    }) {
      setSquares(myObj.squares);
      setGameStatus(myObj.status);

      if (gameWon(myObj.squares)) {
        setGameStatus(WINNER);
      } else if (gameTie(myObj.squares)) {
        setGameStatus(TIE);
      } else {
        setGameStatus(myObj.currentPlayer);
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
      <div className="flex justify-center content-center max-h-screen mt-30">
        <div className="flex flex-col size-110">
          <span className="flex justify-center pt-1 text-xl font-bold text-white bg-black text-heading rounded-t-xs">
            Tic Tac Toe
            <ConnectionStatus isConnected={isConnected} />
          </span>
          <Board
            squares={squares}
            gameStatus={gameStatus}
            playerChar={playerChar}
            socket={socket}
          />
          <GameInfo playerChar={playerChar} gameStatus={gameStatus} />
          <ResetGame socket={socket} />
        </div>
      </div>
    </>
  );
}
