'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from "socket.io-client"

const SocketContext = createContext<Socket | null | undefined>(undefined)

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<null | Socket>(null);
  // const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      const socket = io("http://localhost:3001");
      setSocket(socket);

      function onConnect() {
        if (socket) {
          // setIsConnected(true);
          console.log(`[CONNECT]: ${socket.id}`);
        }
      }

      function onDisconnect() {
        // setIsConnected(false);
        console.log(`[DISCONNECT]`);
      }

      socket.on("connect", onConnect);
      // socket.on("setup", onSetup);
      socket.on("disconnect", onDisconnect);
      // socket.on("events", onEvents);

      return () => {
        socket.disconnect();
      };
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): Socket | null | undefined => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be made within a SocketProvider")
  }
  return context
}