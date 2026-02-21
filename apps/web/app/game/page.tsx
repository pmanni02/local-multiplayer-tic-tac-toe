"use client";
import { useEffect, useState } from "react";
import { gameTie, gameWon } from "../game-utils";
import { ResetGameButton } from "./reset-game-button";
import { Board } from "./board";
import { GameInfo } from "./game-info";
import { useSocket } from "../socketContext";
import { ConnectionStatus } from "./connection-status";

export const WINNER = "WINNER!";
export const TIE = "TIE!";

export default function Game() {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(false);

  const [squares, setSquares] = useState(Array(9).fill(""));
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [gameStatus, setGameStatus] = useState("");

  useEffect(() => {
    if (socket) {
      setIsConnected(true);

      // get player character, room
      socket.emit("playerConnected", {});

      function onSetup({
        playerCharacter,
        room,
      }: {
        playerCharacter: string;
        room: string;
      }) {
        console.log(`[SETUP]: player char: ${playerCharacter}, room: ${room}`);
        if (playerCharacter === "X" || playerCharacter === "O") {
          setPlayerChar(playerCharacter);
          setCurrentRoom(room);

          // default first turn to client with 'X' playerChar
          setGameStatus(`X`);
        }
      }

      function onEvents({
        squares,
        status,
        currentPlayer,
      }: {
        squares: string[];
        status: string;
        currentPlayer: string;
      }) {
        setSquares(squares);
        setGameStatus(status);

        if (gameWon(squares)) {
          setGameStatus(WINNER);
        } else if (gameTie(squares)) {
          setGameStatus(TIE);
        } else {
          setGameStatus(currentPlayer);
        }
      }

      socket.on("setup", onSetup);
      socket.on("events", onEvents);
    }

    return () => {
      socket?.off("setup");
      socket?.off("events");
    };
  }, [socket]);

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
            room={currentRoom}
            socket={socket}
          />
          <GameInfo
            playerChar={playerChar}
            roomName={currentRoom}
            gameStatus={gameStatus}
          />
          <ResetGameButton roomName={currentRoom} />
        </div>
      </div>
    </>
  );
}
