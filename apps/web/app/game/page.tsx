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
} from "@repo/shared-types";
import { ConnectionStatus } from "./connection-status";
import { redirect } from "next/navigation";

export default function Game() {
  const { socket, sessionId } = useSocketContext();
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
        socket.emit("playerConnected", { sessionId });
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
      socket.on("gameStatus", onGameStatus);
      socket.on("gameEvent", onGameEvent);
      socket.on("gameEnd", onGameEnd);
    } else {
      console.info("Issue initializing socket context provider");

      if (sessionStorage.getItem('gameSessionId')) {
        console.log('do not refresh')
        // TODO: emit event to server to get stored details: room, gameChar
        // - add socket.on() to handle event from ws server
        // - NOTE: may need to reinitialize context provider here
        //   OR just set socket, playerChar, room state
        // - NOTE: game board is not saved on backend, so progress
        //   will be lost
      } else {
        console.log('redirecting to home') //temp
        redirect('/')
      }
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
