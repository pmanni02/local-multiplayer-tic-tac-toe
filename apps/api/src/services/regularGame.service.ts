import { Injectable } from '@nestjs/common';
import { GameStatusMessage, Nullable } from '@repo/shared-types';
import { Socket } from 'socket.io';

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

  removePlayerBySocketId = (socket: Socket) => {
    const roomAndGameInfo = this.getGameInfoBySocketId(socket.id);

    // only update game map if socket.id has been assigned a room
    if (roomAndGameInfo) {
      const { roomName, game } = roomAndGameInfo;

      // delete socket info, update game
      delete game.playerSocketInfo[socket.id];
      const updatedGame: RegularGame = {
        ...game,
        numPlayers: game.numPlayers - 1,
        playerSocketInfo: game.playerSocketInfo,
      };
      this.roomToGameMap.set(roomName, updatedGame);

      return updatedGame;
    }
  };

  getOpenRoomNames = (): string[] => {
    return [...this.roomToGameMap]
      .filter(([_, game]) => {
        return game.numPlayers <= 1;
      })
      .map(([name, _]) => name);
  };

  setRoomToGameMap = (roomName: string, game: RegularGame): void => {
    this.roomToGameMap.set(roomName, game);
  };

  isAlreadyConnected = (socketId: string) => {
    return this.#getRoomBySocketId(socketId) === undefined ? false : true;
  };

  getGameInfoBySocketId = (
    socketId: string,
  ): { roomName: string; game: RegularGame } | null => {
    const room = this.#getRoomBySocketId(socketId);

    if (room) {
      const [name, game] = room;
      return {
        roomName: name,
        game,
      };
    }
    return null;
  };

  getRoomName = () => {
    const openRooms = this.getOpenRoomNames();
    let roomName: string;
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = this.#addRoomAndGame();
    }
    return roomName;
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

  #getRoomBySocketId = (socketId: string) => {
    return [...this.roomToGameMap].find(([_, game]) => {
      const socketIds = this.#getGameSocketIds(game);
      return socketIds.includes(socketId);
    });
  };

  #getGameSocketIds = (game: RegularGame) => {
    return Object.entries(game.playerSocketInfo).map(([id, _]) => id);
  };
}
