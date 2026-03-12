import { Injectable } from '@nestjs/common';
import { Room } from './utils/room';

@Injectable()
export class RoomsManagerService {
  private rooms: Map<string, Room>;
  private numClients: number;

  constructor() {
    this.rooms = new Map();
    this.numClients = 0;
  }

  incrementNumClients() {
    this.numClients++;
    this.#printNumClients();
  }

  decrementNumClients() {
    this.numClients--;
    this.#printNumClients();
  }

  #printNumClients() {
    console.log('NUM CLIENTS', this.numClients);
  }

  getNumClients() {
    return this.numClients;
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

  getRoomBySocketId(socketId: string): Room | null {
    const roomInfo = [...this.rooms].find(([roomName, room]) => {
      const roomPlayers = room.game.getPlayers();
      return roomPlayers.find((player) => {
        return player.getPlayerInfo().socketId === socketId;
      });
    });
    return roomInfo ? roomInfo[1] : null;
  }

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
