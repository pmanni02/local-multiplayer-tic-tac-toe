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
  sessionId: string | null;
};

const SocketContext = createContext<ContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>("")

  useEffect(() => {
    if (!socket) {
      let mySessionId: string | null = ""
      if (sessionStorage.getItem('gameSessionId')) {
        mySessionId = sessionStorage.getItem('gameSessionId')
      } else {
        mySessionId = window.crypto.randomUUID()
        sessionStorage.setItem('gameSessionId', mySessionId)
      }
      setSessionId(mySessionId)

      const mySocket = io("http://localhost:3001", {
        auth: { token: mySessionId }
      });

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

  const contextValue: ContextType = { socket, sessionId };

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
