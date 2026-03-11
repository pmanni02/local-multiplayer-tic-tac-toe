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
  type GameInitializedMessage,
  GameStatusMessage,
  Nullable,
} from '@repo/shared-types';
import { Server, Socket } from 'socket.io';
import { RoomsManagerService } from 'src/services/roomsManager.service';
import { getTimeNow } from 'src/utils';

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
    this.roomsManagerService.incrementNumClients();
  }

  handleDisconnect(socket: Socket): void {
    const msg = {
      message: 'Opponent Disconnected',
    };
    this.handleDisconnectEvent(msg, socket);
    console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);

    this.roomsManagerService.decrementNumClients();
  }

  @SubscribeMessage('gameEnded')
  handGameEnded(@ConnectedSocket() socket: Socket): void {
    const room = this.roomsManagerService.getRoomBySocketId(socket.id);
    const msg = {
      message: 'Opponent Left Game',
    };

    this.handleDisconnectEvent(msg, socket);
    console.log(`[PLAYER LEFT | ${getTimeNow()}]: ${socket.id}`);
    room?.printRoom();
  }

  // playerConnected -> roomDetermined
  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const room = this.roomsManagerService.getRoomBySocketId(socket.id);
    if (!room) {
      this.handleFindNewGame(socket);
    }
  }

  private handleFindNewGame(socket: Socket) {
    const myRoom = this.roomsManagerService.findOpenRoom();

    if (!myRoom.game.playerIsInGame(socket.id)) {
      // get game from room, add player to room
      const myGame = myRoom.game;
      const newPlayer = myGame.addPlayer({
        socketId: socket.id,
        userId: 'temp',
      });
      const newPlayerChar = newPlayer?.getPlayerInfo().gameChar;

      // only emit room/char info to own client
      this.server.to(socket.id).emit('roomDetermined', {
        roomName: myRoom.name,
        playerChar: newPlayerChar,
      });

      // join room
      void socket.join(myRoom.name);

      console.log(`[PLAYER JOINED | ${getTimeNow()}]: ${socket.id}`);
      myRoom.printRoom();
    } else {
      console.error(`socketId: ${socket.id} already in room/game`);
    }
  }

  // gameInitialized -> gameStatus
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
      if (room.game.getPlayers().length === 1) {
        // emit to self (only player room)
        msg = {
          message: 'Waiting for opponent',
        };
      } else if (room.game.getPlayers().length === 2) {
        // emit to all players in room
        msg = {
          message: 'Game Ready',
        };
      }
      if (msg) this.server.to(roomName).emit('gameStatus', msg);
    } else {
      throw new Error(`issue determining game/room info for: ${socket.id}`);
    }
  }

  @SubscribeMessage('gameEvent')
  handleBroadcastGameEvent(
    @MessageBody()
    data: {
      squares: string[];
      currentPlayer: string;
      room: string;
    },
  ): void {
    const eventsMessage: EventsMessageToClient = {
      squares: data.squares,
      currentPlayer: data.currentPlayer,
    };
    this.server.to(data.room).emit('gameEvent', eventsMessage);
  }

  private handleDisconnectEvent(msg: Record<string, string>, socket: Socket) {
    const room = this.roomsManagerService.getRoomBySocketId(socket.id);
    room?.game.removePlayerBySocketId(socket.id);
    const remainingPlayers = room?.game.getPlayers();

    if (remainingPlayers && remainingPlayers.length === 1) {
      const opponentSocketId = remainingPlayers[0].getPlayerInfo().socketId;
      if (msg) socket.to(opponentSocketId).emit('gameStatus', msg);
      room?.printRoom();
    }
  }
}
