import { Injectable } from '@nestjs/common';
import type { OptionalPlayerT, PlayerT } from 'src/types/types';

@Injectable()
export class Player {
  private socketId: string;
  private gameChar: string;
  private userId: string;

  constructor({ socketId, gameChar, userId }: PlayerT) {
    this.gameChar = gameChar;
    this.socketId = socketId;
    this.userId = userId;
  }

  setPlayerInfo({ socketId, gameChar, userId }: OptionalPlayerT) {
    if (socketId) this.socketId = socketId;
    if (gameChar) this.gameChar = gameChar;
    if (userId) this.userId = userId;
  }

  getPlayerInfo(): PlayerT {
    return {
      socketId: this.socketId,
      gameChar: this.gameChar,
      userId: this.userId,
    };
  }
}

@Injectable()
export class Game {
  private players: Player[];
  private status: string;

  constructor() {
    this.players = [];
    this.status = 'pending';
  }

  addPlayer({ socketId, gameChar, userId }: PlayerT): boolean {
    if (this.players.length <= 1) {
      const player = new Player({ socketId, gameChar, userId });
      this.players.push(player);
      return true;
    }
    return false;
  }

  getPlayers() {
    return this.players;
  }

  removePlayerBySocketId(socketId: string) {
    this.players = this.players.filter(
      (player) => player.getPlayerInfo().socketId !== socketId,
    );
  }

  getStatus(): string {
    return this.status;
  }

  setStatus(status: string) {
    this.status = status;
  }
}

@Injectable()
export class Room {
  name: string;
  game: Game;

  // create a game everytime a new room is created
  constructor(name: string) {
    this.name = name;
    this.game = new Game();
  }

  printGame() {
    console.log(this.game);
  }
}

@Injectable()
export class RoomsManagerService {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  getRooms() {
    return this.rooms;
  }

  getRoomByName(roomName: string): Room | undefined {
    return this.rooms.get(roomName);
  }

  removeRoom(roomName: string): boolean {
    return this.rooms.delete(roomName);
  }

  findOpenRoom(): Room {
    const openRooms = [...this.rooms]
      .filter(([_, room]) => {
        return room.game.getPlayers().length <= 1;
      })
      .map(([_, room]) => {
        return room;
      });

    let room: Room;
    if (openRooms.length > 0) {
      room = openRooms[0];
    } else {
      room = this.addRoom();
    }
    return room;
  }

  getRoomBySocketId() {}

  addRoom() {
    const newRoomName = this.#getNewRoomName();
    const newRoom = new Room(newRoomName);
    this.rooms.set(newRoomName, newRoom);
    return newRoom;
  }

  #getNewRoomName = (): string => {
    return `room${this.rooms.size + 1}`;
  };
}

// // init
// const myRoomsManagerService = new RoomsManagerService();
// console.log('myRoomsManagerService', myRoomsManagerService);

// // playerConnected
// const myRoom = myRoomsManagerService.findOpenRoom(); // ALL rooms are initialized with a game
// console.log('myRoom', myRoom);

// // gameInitialized
// // NOTE: would likely get room by name (in event msg)
// const myExistingRoom = myRoomsManagerService.getRoomByName('room1');
// if (myExistingRoom) {
//   const myGame = myExistingRoom.game;
//   myGame.addPlayer({ socketId: '456', userId: '333', gameChar: 'O' });
//   myGame.addPlayer({ socketId: '123', userId: '444', gameChar: 'X' });
//   console.log('myGame', myGame);

//   // disconnect
//   myGame.removePlayerBySocketId('123');
//   console.log('disconnected player');
//   myRoom.printGame();
//   console.log('---------');
// }

// // TEST
// const myRoomCheck = myRoomsManagerService.getRoomByName(myRoom.name);
// const myGameCheck = myRoomCheck?.game;
// const myPlayersCheck = myGameCheck?.getPlayers();
// console.assert(myPlayersCheck?.length === 1, 'a single player still exists');
// console.log('myPlayersCheck', myPlayersCheck);
