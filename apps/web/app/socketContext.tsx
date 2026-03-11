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
};

const SocketContext = createContext<ContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<null | Socket>(null);

  useEffect(() => {
    if (!socket) {
      const mySocket = io("http://localhost:3001");

      function onConnect() {
        console.log(
          `[CONNECT]: ${mySocket ? mySocket.id : ""}, status: ${mySocket.connected}`,
        );
      }

      function onDisconnect() {
        console.log(`[DISCONNECT]`);
      }

      mySocket.on("connect", onConnect);
      mySocket.on("disconnect", onDisconnect);

      setSocket(mySocket);

      return () => {
        mySocket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: ContextType = { socket };

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
