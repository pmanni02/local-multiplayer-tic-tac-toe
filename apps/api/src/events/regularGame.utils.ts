// TODO: refactor into service

export type Game = {
  numPlayers: number;
  playerSocketInfo: Record<string, string>; // {socketId: playerChar}
  gameType: string;
};

// const getNumRooms = (gameMap: Map<string, Game>) => gameMap.size;
export const getOpenRoomName = (gameMap: Map<string, Game>): string[] => {
  const roomInfo = [...gameMap].filter(([roomName, game]) => {
    return game.numPlayers <= 1;
  });

  if (roomInfo.length) {
    return roomInfo.map(([name, game]) => name);
  }
  return [];
};

export const addRoom = (
  gameMap: Map<string, Game>,
  gameType: string,
): string => {
  const newGame = {
    numPlayers: 0,
    playerSocketInfo: {},
    gameType,
  };

  const numRooms = gameMap.size;
  const newRoomName = `room${numRooms + 1}`;
  gameMap.set(newRoomName, newGame);
  return newRoomName;
};

export const getRoomAndGameInfoBySocketId = (
  gameMap: Map<string, Game>,
  socketId: string,
): { roomName: string; game: Game } | null => {
  const room = [...gameMap].find(([roomName, game]) => {
    const socketIds = Object.entries(game.playerSocketInfo).map(
      ([id, char]) => id,
    );
    return socketIds.includes(socketId);
  });

  if (room) {
    const [name, game] = room;
    return {
      roomName: name,
      game,
    };
  }
  return null;
};

export const getPlayerChar = (game: Game): string => {
  const numPlayers = game?.numPlayers;
  let playerChar: string;
  if (
    numPlayers === 0 ||
    (numPlayers === 1 && Object.entries(game.playerSocketInfo)[0][1] !== 'X')
  ) {
    playerChar = 'X';
  } else {
    playerChar = 'O';
  }
  return playerChar;
};
