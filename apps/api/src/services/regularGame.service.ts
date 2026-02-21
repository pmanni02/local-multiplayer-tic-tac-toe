import { Injectable } from '@nestjs/common';

export type Game = {
  numPlayers: number;
  playerSocketInfo: Record<string, string>; // {socketId: playerChar}
  gameType: string;
};

@Injectable()
export class RegularGameService {
  private readonly gameMap: Map<string, Game> = new Map();

  getGameMap = () => {
    return this.gameMap;
  };

  getOpenRoomName = (): string[] => {
    const roomInfo = [...this.gameMap].filter(([roomName, game]) => {
      return game.numPlayers <= 1;
    });

    if (roomInfo.length) {
      return roomInfo.map(([name, game]) => name);
    }
    return [];
  };

  addRoom = (gameType: string): string => {
    const newGame = {
      numPlayers: 0,
      playerSocketInfo: {},
      gameType,
    };

    const numRooms = this.gameMap.size;
    const newRoomName = `room${numRooms + 1}`;
    this.gameMap.set(newRoomName, newGame);
    return newRoomName;
  };

  getRoomAndGameInfoBySocketId = (
    socketId: string,
  ): { roomName: string; game: Game } | null => {
    const room = [...this.gameMap].find(([roomName, game]) => {
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

  getPlayerChar = (game: Game): string => {
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
}
