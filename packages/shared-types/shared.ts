export type Nullable<T> = T | null | undefined;

export type GameConnectionStates = "connected" | "disconnected" | "pendingGame";
export type ValidGameStatus = "pendingGame" | "opponentLeft" | "ready";

// WS messages
export type GameStatusMessage = {
  message: string;
  status: ValidGameStatus;
};

export type RoomDeterminedMessage = {
  roomName: string;
  playerChar: string;
};

export type GameInitializedMessage = {
  roomName: string;
};

export type EventsMessageToServer = {
  squares: string[];
  status: string;
  currentPlayer: string;
  room: string;
};

export type EventsMessageToClient = Omit<EventsMessageToServer, "room">;
