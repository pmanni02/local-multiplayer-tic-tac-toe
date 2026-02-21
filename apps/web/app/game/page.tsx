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

export type GAME_CONNECTION_STATES = "connected" | "disconnected" | "pendingGame";

export default function Game() {
  const socket = useSocket();
  const [gameConnectionState, setGameConnectionState] = useState<GAME_CONNECTION_STATES>("disconnected")
  const [connectionMessage, setConnectionMessage] = useState("")

  const [squares, setSquares] = useState(Array(9).fill(""));
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  const [currentRoom, setCurrentRoom] = useState("");

  // TODO: rename game status and/or combine with gameConnectionState, connectionMessage
  const [gameStatus, setGameStatus] = useState("");

  useEffect(() => {
    if (socket) {
      setGameConnectionState("connected")
      setConnectionMessage("")

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
          // setConnectionMessage("Connected to Server")
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

      // TODO: create type for valid statuses
      function onGameStatus({ message, status }: { message: string, status: string }) {
        console.log('msg', message)
        if (status === 'pendingGame') {
          setGameConnectionState("pendingGame")
        } else if(status === 'ready') {
          setGameConnectionState("connected")
        }
        setConnectionMessage(message)
      }

      socket.on("setup", onSetup);
      socket.on("events", onEvents);
      socket.on("gameStatus", onGameStatus);
    } else {
      setGameConnectionState("disconnected")
      setConnectionMessage("Disconnected")
    }

    return () => {
      socket?.off("setup");
      socket?.off("events");
      socket?.off("gameStatus")
    };
  }, [socket]);

  return (
    <>
      <div className="flex justify-center content-center max-h-screen mt-30">
        <div className="flex flex-col size-110">
          <span className="flex justify-center pt-1 text-xl font-bold text-white bg-black text-heading rounded-t-xs">
            Tic Tac Toe
            <ConnectionStatus connectionState={gameConnectionState} connectionMessage={connectionMessage} />
          </span>
          <Board
            squares={squares}
            gameStatus={gameStatus}
            connectionState={gameConnectionState}
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
