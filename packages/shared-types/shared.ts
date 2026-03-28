export type Nullable<T> = T | null | undefined;

export const WINNER = "WINNER!";
export const TIE = "TIE!";
export const LOSER = "LOSER!";
export type VALID_END_GAME_STATUSES = typeof WINNER | typeof TIE | typeof LOSER;

// WS messages
export type GameStatusMessage = {
  message: string;
  squares?: string[];
};

// TODO: add to events.gateway.ts
export type GameEndMessage = {
  message: VALID_END_GAME_STATUSES;
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
