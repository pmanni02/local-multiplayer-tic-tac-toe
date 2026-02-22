"use client";
import { useEffect, useState } from "react";
import { gameTie, gameWon } from "../game-utils";
import { ResetGameButton } from "./reset-game-button";
import { Board } from "./board";
import { GameInfo } from "./game-info";
import { useSocket } from "../socketContext";
import { ConnectionStatus } from "./connection-status";
import { EndsGameButton } from "./end-game-button";
import {
  GAME_CONNECTION_STATES,
  GameInitializedMessage,
} from "@repo/shared-types";

export const WINNER = "WINNER!";
export const TIE = "TIE!";

export default function Game() {
  const { socket, roomName } = useSocket();

  const [gameConnectionState, setGameConnectionState] =
    useState<GAME_CONNECTION_STATES>("pendingGame");
  const [connectionMessage, setConnectionMessage] = useState("...");

  const [squares, setSquares] = useState(Array(9).fill(""));
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  const [gameStatus, setGameStatus] = useState("");

  // TODO: add users to handle reconnection/page refresh
  useEffect(() => {
    if (socket && roomName) {
      // get player character, room
      const gameInitializedMessage: GameInitializedMessage = {
        roomName,
      };
      socket.emit("gameInitialized", gameInitializedMessage);

      function onSetup({ playerCharacter }: { playerCharacter: string }) {
        console.log(
          `[SETUP]: player char: ${playerCharacter}, room: ${roomName}`,
        );
        if (playerCharacter === "X" || playerCharacter === "O") {
          setPlayerChar(playerCharacter);

          // default first turn to client with 'X' playerChar
          setGameStatus(`X`);
        }
      }

      // TODO: create type for valid statuses
      function onGameStatus({
        message,
        status,
      }: {
        message: string;
        status: string;
      }) {
        if (status === "pendingGame") {
          setGameConnectionState("pendingGame");
        } else if (status === "ready") {
          setGameConnectionState("connected");
        }
        setConnectionMessage(message);
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
      setGameConnectionState("disconnected");
      setConnectionMessage("Disconnected");
    }

    return () => {
      socket?.off("setup");
      socket?.off("events");
      socket?.off("gameStatus");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex justify-center content-center h-screen items-center">
        <div className="flex flex-col w-100 h-100">
          <span className="flex justify-center text-xl font-bold text-white bg-black text-heading rounded-t-md">
            Regular
            <ConnectionStatus
              connectionState={gameConnectionState}
              connectionMessage={connectionMessage}
            />
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
          <div className="flex flex-row justify-center gap-1">
            <ResetGameButton />
            <EndsGameButton />
          </div>
        </div>
      </div>
    </>
  );
}
