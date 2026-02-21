import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  addRoom,
  Game,
  getOpenRoomName,
  getPlayerChar,
  getRoomAndGameInfoBySocketId,
} from './regularGame.utils';

const GAME_MAP: Map<string, Game> = new Map();

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
  }

  // TODO: handle reconnection logic
  handleConnection(socket: Socket) {
    // determine roomName, get open room OR create new room
    let roomName: string;
    const openRooms = getOpenRoomName(GAME_MAP);
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = addRoom(GAME_MAP, 'regular');
    }

    // get game using roomName, either existing or new game
    const game = GAME_MAP.get(roomName);
    if (game) {
      const playerChar = getPlayerChar(game);
      game.numPlayers += 1;
      game.playerSocketInfo[socket.id] = playerChar;
      console.log('GAME_MAP', GAME_MAP);

      // join room
      void socket.join(roomName);

      console.log(
        `[CONNECTED]: ${socket.id}, char: ${playerChar}, room: ${roomName}`,
      );
    } else {
      throw new Error(`issue determine game/room info for: ${socket.id}`);
    }
  }

  handleDisconnect(socket: Socket) {
    const roomAndGameInfo = getRoomAndGameInfoBySocketId(GAME_MAP, socket.id);
    if (roomAndGameInfo) {
      const { roomName, game } = roomAndGameInfo;
      delete game.playerSocketInfo[socket.id];
      const updatedGame: Game = {
        ...game,
        numPlayers: game.numPlayers - 1,
        playerSocketInfo: game.playerSocketInfo,
      };
      GAME_MAP.set(roomName, updatedGame);
      console.log('GAME_MAP', GAME_MAP);
      console.log(`[DISCONNECTED]: ${socket.id}`);
    } else {
      throw new Error(`issue disconnecting socket w/ id: ${socket.id}`);
    }
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const roomAndGameInfo = getRoomAndGameInfoBySocketId(GAME_MAP, socket.id);
    if (roomAndGameInfo) {
      const { roomName, game } = roomAndGameInfo;
      const playerChar = game.playerSocketInfo[socket.id];

      // send playerChar to connected socket
      this.server.to(socket.id).emit('setup', {
        playerCharacter: playerChar,
        room: roomName,
      });

      console.log(`[PLAYER INFO EMITTED]: ${socket.id}`);
    } else {
      throw new Error(`room with socket id: ${socket.id} not found`);
    }
  }

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody()
    data: {
      squares: string[];
      status: string;
      currentPlayer: string;
      room: string;
    },
    @ConnectedSocket() socket: Socket,
  ): void {
    console.log(`[EVENTS]: ${JSON.stringify(data)} for ROOM: ${data.room}`);
    this.server.to(data.room).emit('events', {
      squares: data.squares,
      status: data.status,
      currentPlayer: data.currentPlayer,
      room: data.room,
    });
  }
}
