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
        query: { sessionId: mySessionId },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      function onConnect() {
        console.log(
          `[CONNECT]: ${mySocket ? mySocket.id : ""}, 
           sessionId: ${mySessionId},
           status: ${mySocket.connected}`,
        );

        // On initial connect, check if we should attempt session recovery
        if (mySessionId && sessionStorage.getItem('gameSessionId')) {
          console.log(`[CONNECT]: Attempting session recovery for: ${mySessionId}`);
          mySocket.emit('sessionRecovery', { sessionId: mySessionId });
        }
      }

      function onDisconnect() {
        console.log(`[DISCONNECT]`);
      }

      function onReconnect() {
        console.log(`[RECONNECT]: Attempting to recover session...`);
        if (mySessionId) {
          mySocket.emit('sessionRecovery', { sessionId: mySessionId });
        }
      }

      mySocket.on("connect", onConnect);
      mySocket.on("disconnect", onDisconnect);
      mySocket.on("reconnect", onReconnect);

      setSocket(mySocket);

      return () => {
        mySocket.off("connect");
        mySocket.off("disconnect");
        mySocket.off("reconnect");
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
