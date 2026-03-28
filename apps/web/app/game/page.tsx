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
  VALID_END_GAME_STATUSES,
} from "@repo/shared-types";
import { ConnectionStatus } from "./connection-status";

export default function Game() {
  const { socket } = useSocketContext();
  const [squares, setSquares] = useState(Array(9).fill(""));
  const [connectionMessage, setConnectionMessage] = useState("...");

  // room and player char
  const [room, setRoom] = useState("");
  const [playerChar, setPlayerChar] = useState("");

  // displays win/tie and current turn
  const [gameResult, setGameResult] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");

  // TODO: add users to handle reconnection/page refresh
  useEffect(() => {
    if (socket) {
      if (socket.connected) {
        console.log("PLAYER CONNECTED");
        socket.emit("playerConnected");
      }

      // default first turn to player 'X'
      setCurrentPlayer("X");

      function onRoomDetermined({
        roomName,
        playerChar,
      }: RoomDeterminedMessage) {
        setRoom(roomName);
        setPlayerChar(playerChar);
        console.log(`[ROOM]: ${roomName} | [CHAR]: ${playerChar}`);

        // get player character, room
        const gameInitializedMessage: GameInitializedMessage = {
          roomName,
        };
        socket!.emit("gameInitialized", gameInitializedMessage);
      }

      function onGameStatus({ message }: GameStatusMessage) {
        setConnectionMessage(message);
      }

      function onGameEnd({ message, squares }: { message: VALID_END_GAME_STATUSES, squares: string[] }) {
        setSquares(squares);
        setGameResult(message)
      }

      function onGameStateChange({
        squares,
        currentPlayer,
      }: EventsMessageToClient) {
        setSquares(squares);
        setCurrentPlayer(currentPlayer);
        setGameResult("")
      }

      socket.on("roomDetermined", onRoomDetermined);
      socket.on("gameStatus", onGameStatus);
      socket.on("gameEvent", onGameStateChange);
      socket.on("gameEnd", onGameEnd);

    } else {
      console.error("Issue initializing socket context provider");
      setConnectionMessage("Disconnected");
    }

    return () => {
      socket?.off("roomDetermined");
      socket?.off("gameEvent");
      socket?.off("gameEnd");
      socket?.off("gameStatus");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
