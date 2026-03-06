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
import { RegularGameService } from 'src/services/regularGame.service';

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
  constructor(private regularGameService: RegularGameService) {}
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
    this.regularGameService = new RegularGameService();
  }

  handleConnection(socket: Socket): void {
    console.log(`[CONNECTED | ${getTimeNow()}]: ${socket.id}`);
  }

  handleDisconnect(socket: Socket): void {
    const updatedGame = this.regularGameService.removePlayerBySocketId(socket);

    if (updatedGame) {
      if (updatedGame.numPlayers === 1) {
        const opponentSocketId = Object.keys(updatedGame.playerSocketInfo)[0];
        const msg = {
          message: 'Opponent Disconnected',
          status: 'pendingGame',
        };
        if (msg) socket.to(opponentSocketId).emit('gameStatus', msg);
      }
      this.regularGameService.printRoomToGameMap();
      console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);
    } else {
      throw new Error(`issue disconnecting after leaving game`);
    }
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const roomName = this.regularGameService.getRoomName();
    this.regularGameService.printRoomToGameMap();

    // join room
    void socket.join(roomName);

    this.server.to(roomName).emit('roomDetermined', { roomName });
    console.log(`[ROOM      | ${getTimeNow()}]: ${socket.id}, ${roomName}`);
  }

  @SubscribeMessage('gameInitialized')
  handleGameInitialized(
    @MessageBody()
    data: GameInitializedMessage,
    @ConnectedSocket() socket: Socket,
  ): void {
    const { roomName } = data;
    const game = this.regularGameService.getGame(roomName);

    // if there is a game and socketId is not in gameMap already, update gameMap
    if (game && !this.regularGameService.isAlreadyConnected(socket.id)) {
      const updatedGame = this.regularGameService.addPlayerBySocketId(
        game,
        socket.id,
      );

      this.regularGameService.setRoomToGameMap(roomName, game);
      this.regularGameService.printRoomToGameMap();

      // send playerChar to connected socket
      this.server.to(socket.id).emit('setup', {
        playerCharacter: updatedGame.playerSocketInfo[socket.id],
      });

      let msg: Nullable<GameStatusMessage> = null;
      // check if player needs an opponent
      if (game.numPlayers === 1) {
        // emit to self (only player room)
        msg = {
          message: 'Waiting for opponent',
          status: 'pendingGame',
        };
      } else if (game.numPlayers === 2) {
        // emit to all players in room
        msg = {
          message: 'Game Ready',
          status: 'ready',
        };
      }

      if (msg) this.server.to(roomName).emit('gameStatus', msg);
    }

    if (!game) {
      throw new Error(`issue determining game/room info for: ${socket.id}`);
    }
    console.log(`[GAME INIT | ${getTimeNow()}]: ${socket.id}`);
  }

  @SubscribeMessage('gameEnded')
  handGameEnded(@ConnectedSocket() socket: Socket): void {
    const updatedGame = this.regularGameService.removePlayerBySocketId(socket);

    if (updatedGame) {
      if (updatedGame.numPlayers === 1) {
        const opponentSocketId = Object.keys(updatedGame.playerSocketInfo)[0];
        const msg = {
          message: 'Opponent Left Game',
          status: 'opponentLeft',
        };
        if (msg) socket.to(opponentSocketId).emit('gameStatus', msg);
      }
      this.regularGameService.printRoomToGameMap();
      console.log(`[LEFT GAME | ${getTimeNow()}]: ${socket.id}`);
    } else {
      throw new Error(`issue disconnecting after leaving game`);
    }
  }

  @SubscribeMessage('broadcastGameEvent')
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
    this.server.to(data.room).emit('broadcastGameEvent', eventsMessage);
  }
}
