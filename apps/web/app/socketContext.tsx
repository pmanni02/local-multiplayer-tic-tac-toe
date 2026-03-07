"use client";
import { RoomDeterminedMessage } from "@repo/shared-types";
import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

type ContextType = {
  socket: Socket | null;
  roomName: string;
  playerChar: string;
};

const SocketContext = createContext<ContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<null | Socket>(null);
  const [room, setRoom] = useState("");
  const [playerChar, setPlayerChar] = useState("");

  useEffect(() => {
    if (!socket) {
      const mySocket = io("http://localhost:3001");

      if (!mySocket.connected) {
        mySocket.connect();
      }

      function onConnect() {
        console.log(
          `[CONNECT]: ${mySocket ? mySocket.id : ""}, status: ${mySocket.connected}`,
        );
        mySocket.emit("playerConnected");
      }

      function onRoomDetermined({
        roomName,
        playerChar,
      }: RoomDeterminedMessage) {
        setRoom(roomName);
        setPlayerChar(playerChar);
        console.log(`[ROOM]: ${roomName} | [CHAR]: ${playerChar}`);
      }

      function onDisconnect() {
        console.log(`[DISCONNECT]`);
      }

      mySocket.on("roomDetermined", onRoomDetermined);
      mySocket.on("connect", onConnect);
      mySocket.on("disconnect", onDisconnect);

      setSocket(mySocket);

      return () => {
        mySocket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: ContextType = {
    socket,
    roomName: room,
    playerChar,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): ContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be made within a SocketProvider");
  }
  return context;
};
