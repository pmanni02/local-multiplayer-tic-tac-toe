import { Injectable } from '@nestjs/common';

interface RegularGame {
  numPlayers: number;
  playerSocketInfo: Record<string, string>; // {socketId: playerChar}
}

export type RoomToGameMap = Map<string, RegularGame>;

@Injectable()
export class RegularGameService {
  private readonly roomToGameMap: RoomToGameMap = new Map();

  printRoomToGameMap = () => {
    console.log('GAME_MAP', this.roomToGameMap);
  };

  getGame = (roomName: string) => {
    return this.roomToGameMap.get(roomName);
  };

  addPlayerBySocketId = (game: RegularGame, socketId: string) => {
    const playerChar = this.#getPlayerChar(game);
    game.numPlayers += 1;
    game.playerSocketInfo[socketId] = playerChar;
    return game;
  };

  removePlayerBySocketId = (socketId: string) => {
    const roomAndGameInfo = this.getGameInfoBySocketId(socketId);

    // only update game map if socket.id has been assigned a room
    if (roomAndGameInfo) {
      const { roomName, game } = roomAndGameInfo;

      // delete socket info, update game
      delete game.playerSocketInfo[socketId];
      const updatedGame: RegularGame = {
        ...game,
        numPlayers: game.numPlayers - 1,
        playerSocketInfo: game.playerSocketInfo,
      };
      this.roomToGameMap.set(roomName, updatedGame);

      return updatedGame;
    }
  };

  setRoomToGameMap = (roomName: string, game: RegularGame): void => {
    this.roomToGameMap.set(roomName, game);
  };

  isAlreadyConnected = (socketId: string): boolean => {
    return this.#getRoomAndGameInfoBySocketId(socketId) === undefined
      ? false
      : true;
  };

  getGameInfoBySocketId = (
    socketId: string,
  ): { roomName: string; game: RegularGame } | null => {
    const roomAndGameInfo = this.#getRoomAndGameInfoBySocketId(socketId);

    if (roomAndGameInfo) {
      const [name, game] = roomAndGameInfo;
      return {
        roomName: name,
        game,
      };
    }
    return null;
  };

  getRoomName = () => {
    const openRooms = this.#getOpenRoomNames();
    let roomName: string;
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = this.#addRoomAndGame();
    }
    return roomName;
  };

  #getOpenRoomNames = (): string[] => {
    return [...this.roomToGameMap]
      .filter(([_, game]) => {
        return game.numPlayers <= 1;
      })
      .map(([name, _]) => name);
  };

  #getRoomAndGameInfoBySocketId = (socketId: string) => {
    return [...this.roomToGameMap].find(([_, game]) => {
      const socketIds = this.#getGameSocketIds(game);
      return socketIds.includes(socketId);
    });
  };

  // defaults to setting first connected client to 'X'
  #getPlayerChar = (game: RegularGame): string => {
    const numPlayers = game.numPlayers;
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

  #addRoomAndGame = (): string => {
    const newGame: RegularGame = {
      numPlayers: 0,
      playerSocketInfo: {},
    };

    const newRoomName = this.#getNewRoomName();
    this.roomToGameMap.set(newRoomName, newGame);
    return newRoomName;
  };

  #getNewRoomName = (): string => {
    return `room${this.roomToGameMap.size + 1}`;
  };

  #getGameSocketIds = (game: RegularGame) => {
    return Object.entries(game.playerSocketInfo).map(([id, _]) => id);
  };
}
