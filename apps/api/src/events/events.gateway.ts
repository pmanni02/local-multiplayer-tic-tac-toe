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
import {
  type EventsMessageToClient,
  type EventsMessageToServer,
  type GameInitializedMessage,
  GameStatusMessage,
  Nullable,
  RoomDeterminedMessage,
} from '@repo/shared-types';
import { Server, Socket } from 'socket.io';
import { RoomsManagerService } from 'src/services/roomsManager.service';

export const getTimeNow = (): string => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();
  return `${h}:${m}:${s}:${ms}`;
};

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private roomsManagerService: RoomsManagerService) {}
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
    this.roomsManagerService = new RoomsManagerService();
  }

  handleConnection(socket: Socket): void {
    console.log(`[CONNECTED | ${getTimeNow()}]: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): void {
    const room = this.roomsManagerService.getRoomBySocketId(socket.id);
    room?.game.removePlayerBySocketId(socket.id);
    const remainingPlayers = room?.game.getPlayers();
    room?.printRoom();

    if (remainingPlayers) {
      if (remainingPlayers.length === 1) {
        const opponentSocketId = remainingPlayers[0].getPlayerInfo().socketId;
        const msg = {
          message: 'Opponent Disconnected',
          status: 'pendingGame',
        };
        if (msg) socket.to(opponentSocketId).emit('gameStatus', msg);
      }
      console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);
    }
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const myRoom = this.roomsManagerService.findOpenRoom();

    // get game from room, add player to room
    const myGame = myRoom.game;
    const newPlayer = myGame.addPlayer({
      socketId: socket.id,
      userId: 'temp',
    });
    const newPlayerChar = newPlayer?.getPlayerInfo().gameChar;

    // join room
    void socket.join(myRoom.name);

    // only emit room/char info to own client
    this.server.to(socket.id).emit('roomDetermined', {
      roomName: myRoom.name,
      playerChar: newPlayerChar,
    });
    myRoom.printRoom();
  }

  @SubscribeMessage('gameInitialized')
  handleGameInitialized(
    @MessageBody()
    data: GameInitializedMessage,
    @ConnectedSocket() socket: Socket,
  ): void {
    const { roomName } = data;
    const room = this.roomsManagerService.getRoomByName(roomName);

    // if there is a game and socketId is not in gameMap already, update gameMap
    if (room) {
      let msg: Nullable<GameStatusMessage> = null;
      // check if player needs an opponent
      if (room.game.getPlayers().length === 1) {
        // emit to self (only player room)
        msg = {
          message: 'Waiting for opponent',
          status: 'pendingGame',
        };
      } else if (room.game.getPlayers().length === 2) {
        // emit to all players in room
        msg = {
          message: 'Game Ready',
          status: 'ready',
        };
      }

      if (msg) this.server.to(roomName).emit('gameStatus', msg);
    }

    if (!room) {
      throw new Error(`issue determining game/room info for: ${socket.id}`);
    }
    console.log(`[GAME INIT | ${getTimeNow()}]: ${socket.id}`);
  }

  @SubscribeMessage('gameEnded')
  handGameEnded(@ConnectedSocket() socket: Socket): void {
    const room = this.roomsManagerService.getRoomBySocketId(socket.id);
    room?.game.removePlayerBySocketId(socket.id);
    const remainingPlayers = room?.game.getPlayers();
    room?.printRoom();

    if (remainingPlayers) {
      if (remainingPlayers.length === 1) {
        const opponentSocketId = remainingPlayers[0].getPlayerInfo().socketId;
        const msg = {
          message: 'Opponent Left Game',
          status: 'opponentLeft',
        };
        if (msg) socket.to(opponentSocketId).emit('gameStatus', msg);
      }
      console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);
    }
  }

  @SubscribeMessage('gameEvent')
  handleBroadcastGameEvent(
    @MessageBody()
    data: {
      squares: string[];
      status: string;
      currentPlayer: string;
      room: string;
    },
  ): void {
    const eventsMessage: EventsMessageToClient = {
      squares: data.squares,
      status: data.status,
      currentPlayer: data.currentPlayer,
    };
    this.server.to(data.room).emit('gameEvent', eventsMessage);
  }
}
