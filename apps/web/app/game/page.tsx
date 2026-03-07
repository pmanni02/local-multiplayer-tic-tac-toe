"use client";
import { useEffect, useState } from "react";
import { gameTie, gameWon } from "../game-utils";
import { ResetGameButton } from "./reset-game-button";
import { Board } from "./board";
import { GameInfo } from "./game-info";
import { useSocketContext } from "../socketContext";
import { EndGameButton } from "./end-game-button";
import {
  EventsMessageToClient,
  GameConnectionStates,
  GameInitializedMessage,
  GameStatusMessage,
} from "@repo/shared-types";
import { ConnectionStatus } from "./connection-status";

export const WINNER = "WINNER!";
export const TIE = "TIE!";

export default function Game() {
  const { socket, roomName } = useSocketContext();

  const [gameConnectionState, setGameConnectionState] =
    useState<GameConnectionStates>("pendingGame");
  const [connectionMessage, setConnectionMessage] = useState("...");

  const [squares, setSquares] = useState(Array(9).fill(""));
  const [playerChar, setPlayerChar] = useState<"X" | "O" | "">("");
  const [gameStatus, setGameStatus] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("")

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
          setCurrentPlayer('X')
        }
      }

      // TODO: create type for valid statuses
      function onGameStatus({ message, status }: GameStatusMessage) {
        if (status === "pendingGame" || status === "opponentLeft") {
          setGameConnectionState("pendingGame");
        } else if (status === "ready") {
          setGameConnectionState("connected");
        }
        setConnectionMessage(message);
      }

      function onBroadcastGameEvent({
        squares,
        status,
        currentPlayer,
      }: EventsMessageToClient) {
        setSquares(squares);
        setGameStatus(status);
        setCurrentPlayer(currentPlayer)

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
      socket.on("gameEvent", onBroadcastGameEvent);
    } else {
      setGameConnectionState("disconnected");
      setConnectionMessage("Disconnected");
    }

    return () => {
      socket?.off("setup");
      socket?.off("gameEvent");
      socket?.off("gameStatus");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex justify-center content-center h-screen items-center bg-light-blue">
        <div className="flex flex-col gap-y-2">
          <ConnectionStatus
            connectionState={gameConnectionState}
            connectionMessage={connectionMessage}
            currentPlayer={currentPlayer}
            playerChar={playerChar}
          />
          <Board
            squares={squares}
            gameStatus={gameStatus}
            connectionState={gameConnectionState}
            playerChar={playerChar}
            currentPlayer={currentPlayer}
            room={roomName}
            socket={socket}
          />
          <div className="flex flex-row justify-center gap-2 p-[2px]">
            <ResetGameButton />
            <EndGameButton />
          </div>
          <div className="flex justify-center gap-5 rounded-b-md text-black items-center text-m">
            <GameInfo roomName={roomName} />
          </div>
        </div>
      </div>
    </>
  );
}
