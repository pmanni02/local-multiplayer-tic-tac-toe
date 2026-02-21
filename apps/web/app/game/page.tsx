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
  const { socket, roomName } = useSocket();

  const [gameConnectionState, setGameConnectionState] = useState<GAME_CONNECTION_STATES>("pendingGame")
  const [connectionMessage, setConnectionMessage] = useState("...")

  const [squares, setSquares] = useState(Array(9).fill(""));
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  // const [currentRoom, setCurrentRoom] = useState("");

  // TODO: combine with gameConnectionState, connectionMessage
  // currently have two different 'status's (connection/game status, player turn/game result)
  const [gameStatus, setGameStatus] = useState("");

  // TODO: look into how to handle reconnection/page refresh
  useEffect(() => {
    if (socket && roomName) {

      // get player character, room
      socket.emit("gameInitialized", {
        roomName: roomName
      });

      function onSetup({
        playerCharacter,
      }: {
        playerCharacter: string;
      }) {
        console.log(`[SETUP]: player char: ${playerCharacter}, room: ${roomName}`);
        if (playerCharacter === "X" || playerCharacter === "O") {
          setPlayerChar(playerCharacter);

          // default first turn to client with 'X' playerChar
          setGameStatus(`X`);
          // setConnectionMessage("Connected to Server")
        }
      }

      // TODO: create type for valid statuses
      function onGameStatus({ message, status }: { message: string, status: string }) {
        console.log('msg', message)
        if (status === 'pendingGame') {
          setGameConnectionState("pendingGame")
        } else if (status === 'ready') {
          setGameConnectionState("connected")
        }
        setConnectionMessage(message)
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
      socket.on("gameStatus", onGameStatus);
      socket.on("events", onEvents);
    } else {
      setGameConnectionState("disconnected")
      setConnectionMessage("Disconnected")
    }

    return () => {
      socket?.off("setup");
      socket?.off("events");
      socket?.off("gameStatus")
    };
  }, []);

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
            room={roomName}
            socket={socket}
          />
          <GameInfo
            playerChar={playerChar}
            roomName={roomName}
            gameStatus={gameStatus}
          />
          <ResetGameButton />
        </div>
      </div>
    </>
  );
}
