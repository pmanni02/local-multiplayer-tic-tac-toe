"use client";
import { useEffect, useState } from "react";
import { ResetGameButton } from "./reset-game-button";
import { Board } from "./board";
import { GameInfo } from "./game-info";
import { useSocketContext } from "../socketContext";
import { EndGameButton } from "./end-game-button";
import {
  EventsMessageToClient,
  GameInitializedMessage,
  GameStatusMessage,
  RoomDeterminedMessage,
  SessionRecoveredMessage,
} from "@repo/shared-types";
import { ConnectionStatus } from "./connection-status";

export default function Game() {
  const { socket, sessionId } = useSocketContext();
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [connectionMessage, setConnectionMessage] = useState("...");

  // Room and player char
  const [room, setRoom] = useState("");
  const [playerChar, setPlayerChar] = useState("");

  // Displays win/tie and current turn
  const [gameResult, setGameResult] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [hasAttemptedRecovery, setHasAttemptedRecovery] = useState(false);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem('gameSessionId');

    // Handle session recovery logic
    if (storedSessionId && !hasAttemptedRecovery) {
      if (socket && socket.connected) {
        // Socket is connected, attempt recovery immediately
        console.log(`[SESSION RECOVERY]: Attempting to recover session: ${storedSessionId}`);
        socket.emit('sessionRecovery', { sessionId: storedSessionId });
        setHasAttemptedRecovery(true);
      } else if (!socket) {
        // Socket is null, wait for it to be available
        // Don't set hasAttemptedRecovery yet - we'll try again when socket is available
        console.log(`[SESSION RECOVERY]: Socket not ready, waiting for connection...`);
      }
    } else if (!storedSessionId && socket && socket.connected && !room) {
      // No stored session, start fresh game
      socket.emit("playerConnected", { sessionId });
    }

    if (socket) {
      // Default first turn to player 'X'
      setCurrentPlayer("X");

      function onRoomDetermined({
        roomName,
        playerChar,
      }: RoomDeterminedMessage) {
        setRoom(roomName);
        setPlayerChar(playerChar);
        console.log(`[ROOM]: ${roomName} | [CHAR]: ${playerChar}`);

        // Get player character, room
        const gameInitializedMessage: GameInitializedMessage = {
          roomName,
        };
        socket!.emit("gameInitialized", gameInitializedMessage);
      }

      function onSessionRecovered({
        roomName,
        playerChar,
        squares,
        currentPlayer,
      }: SessionRecoveredMessage) {
        setRoom(roomName);
        setPlayerChar(playerChar);
        setSquares(squares);
        setCurrentPlayer(currentPlayer);
        setConnectionMessage("Session Recovered");

        console.log(
          `[SESSION RECOVERED]: ${roomName} | ${playerChar} | Squares: ${squares}`
        );

        // Re-join the game
        const gameInitializedMessage: GameInitializedMessage = {
          roomName,
        };
        socket!.emit("gameInitialized", gameInitializedMessage);
      }

      function onSessionRecoveryFailed() {
        console.log("[SESSION RECOVERY FAILED]: Starting fresh game");
        socket!.emit("playerConnected", { sessionId });
      }

      function onGameStatus({ message }: GameStatusMessage) {
        setConnectionMessage(message);
      }

      function onGameEnd({
        message,
        squares,
      }: {
        message: string;
        squares: string[];
      }) {
        setSquares(squares);
        setGameResult(message);
      }

      function onGameEvent({
        squares,
        currentPlayer,
      }: EventsMessageToClient) {
        setSquares(squares);
        setCurrentPlayer(currentPlayer);
        setGameResult("");
      }

      socket.on("roomDetermined", onRoomDetermined);
      socket.on("sessionRecovered", onSessionRecovered);
      socket.on("sessionRecoveryFailed", onSessionRecoveryFailed);
      socket.on("gameStatus", onGameStatus);
      socket.on("gameEvent", onGameEvent);
      socket.on("gameEnd", onGameEnd);

      return () => {
        socket?.off("roomDetermined");
        socket?.off("sessionRecovered");
        socket?.off("sessionRecoveryFailed");
        socket?.off("gameEvent");
        socket?.off("gameEnd");
        socket?.off("gameStatus");
      };
    } else {
      console.info("Issue initializing socket context provider");

      if (sessionStorage.getItem('gameSessionId')) {
        console.log('Waiting for socket connection...')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, hasAttemptedRecovery]);

  return (
    <>
      <div className="flex justify-center content-center h-screen items-center bg-light-blue">
        <div className="flex flex-col gap-y-2">
          <ConnectionStatus
            connectionMessage={connectionMessage}
            currentPlayer={currentPlayer}
            playerChar={playerChar}
          />
          <Board
            squares={squares}
            gameResult={gameResult}
            connectionMessage={connectionMessage}
            playerChar={playerChar}
            currentPlayer={currentPlayer}
            room={room}
            socket={socket}
            sessionId={sessionId}
          />
          <div className="flex flex-row justify-center gap-2 p-[2px]">
            <ResetGameButton room={room} />
            <EndGameButton />
          </div>
          <div className="flex justify-center gap-5 rounded-b-md text-black items-center text-m">
            <GameInfo roomName={room} />
          </div>
        </div>
      </div>
    </>
  );
}
