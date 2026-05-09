import { Injectable } from '@nestjs/common';
import { Room } from './utils/room';
import { PlayerT } from '../../types/types';

interface SessionInfo {
  sessionId: string;
  socketId: string;
  roomName: string;
  playerChar: string;
  squares: string[];
  currentPlayer: string;
}

@Injectable()
export class RoomsManagerService {
  private rooms: Map<string, Room>;
  private numClients: number;
  private sessions: Map<string, SessionInfo>;

  constructor() {
    this.rooms = new Map();
    this.numClients = 0;
    this.sessions = new Map();
  }

  incrementNumClients() {
    this.numClients++;
    this.#printNumClients();
  }

  decrementNumClients() {
    if (this.numClients > 0) {
      this.numClients--;
      this.#printNumClients();
    } else {
      throw new Error('numClients is already zero');
    }
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

  getRoomById(type: keyof PlayerT, id: string): Room | null {
    const roomInfo = [...this.rooms].find(([_, room]) => {
      const roomPlayers = room.game.getPlayers();
      return roomPlayers.find((player) => {
        return player.getPlayerInfo()[type] === id;
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

  // Session management methods
  saveSession(
    sessionId: string,
    socketId: string,
    roomName: string,
    playerChar: string,
    squares: string[],
    currentPlayer: string,
  ): void {
    this.sessions.set(sessionId, {
      sessionId,
      socketId,
      roomName,
      playerChar,
      squares,
      currentPlayer,
    });
    // console.log(
    //   `Session saved: ${JSON.stringify(this.sessions.get(sessionId))}`,
    // );
  }

  getSession(sessionId: string): SessionInfo | undefined {
    return this.sessions.get(sessionId);
  }

  updateSessionSocketId(sessionId: string, newSocketId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.socketId = newSocketId;
      this.sessions.set(sessionId, session);
    }
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  updateSessionGameState(
    sessionId: string,
    squares: string[],
    currentPlayer: string,
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.squares = squares;
      session.currentPlayer = currentPlayer;
      this.sessions.set(sessionId, session);
    }
    console.log(
      `Session game state updated: ${JSON.stringify(this.sessions.get(sessionId))}`,
    );
  }
}
