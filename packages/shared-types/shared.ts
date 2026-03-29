export type Nullable<T> = T | null | undefined;

// WS messages
export type GameStatusMessage = {
  message: string;
  squares?: string[];
};

// TODO: add to events.gateway.ts
export type GameEndMessage = {
  // message: VALID_END_GAME_STATUSES;
  squares: string[];
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
  currentPlayer: string;
  room: string;
};

export type EventsMessageToClient = Omit<EventsMessageToServer, "room">;
