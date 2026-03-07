export type PlayerT = {
  socketId: string;
  gameChar: string; // x or o
  userId: string;
};

export type OptionalPlayerT = Partial<PlayerT>;

export type GameT = {
  players: PlayerT[];
  status: string; // (pending, inProgress, ended)
};

export type RoomT = {
  game: GameT;
};

export type Rooms = Map<string, RoomT>;
