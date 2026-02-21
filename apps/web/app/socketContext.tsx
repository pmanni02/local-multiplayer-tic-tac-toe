"use client";

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
};

const SocketContext = createContext<ContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<null | Socket>(null);
  const [room, setRoom] = useState("");

  useEffect(() => {
    if (!socket) {
      const mySocket = io("http://localhost:3001");

      function onConnect() {
        console.log(
          `[CONNECT]: ${mySocket ? mySocket.id : ""}, status: ${mySocket.connected}`,
        );
        mySocket.emit("playerConnected");
      }

      function onRoomDetermined({ roomName }: { roomName: string }) {
        setRoom(roomName);
        console.log(`[ROOM]: ${roomName}`);
      }

      function onDisconnect() {
        console.log(`[DISCONNECT]`);
      }

      mySocket.on("roomDetermined", onRoomDetermined);
      mySocket.on("connect", onConnect);
      mySocket.on("disconnect", onDisconnect);

      setSocket(mySocket);

      return () => {
        // mySocket.off("connect");
        // mySocket.off("disconnect");
        mySocket.disconnect();
      };
    }
  }, []);

  const contextValue: ContextType = {
    socket,
    roomName: room,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): ContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be made within a SocketProvider");
  }
  return context;
};
