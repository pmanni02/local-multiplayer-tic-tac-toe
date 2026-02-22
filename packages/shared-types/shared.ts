export type Nullable<T> = T | null | undefined;

export type GameStatusMessage = {
  message: string;
  status: string;
};

export type RoomDeterminedMessage = {
  roomName: string;
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

export type GAME_CONNECTION_STATES =
  | "connected"
  | "disconnected"
  | "pendingGame";
