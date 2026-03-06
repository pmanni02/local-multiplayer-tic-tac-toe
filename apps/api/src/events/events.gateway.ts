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
    this.regularGameService.removePlayerBySocketId(socket, 'disconnect');

    console.log('GAME_MAP', this.regularGameService.getRoomToGameMap());
    console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    // determine roomName, get open room OR create new room
    let roomName: string;
    const openRooms = this.regularGameService.getOpenRoomNames();
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = this.regularGameService.addRoom('regular');
    }
    console.log('GAME_MAP', this.regularGameService.getRoomToGameMap());

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
    if (game && !this.regularGameService.getGameInfoBySocketId(socket.id)) {
      const playerChar = this.regularGameService.getPlayerChar(game);
      game.numPlayers += 1;
      game.playerSocketInfo[socket.id] = playerChar;

      this.regularGameService.setRoomToGameMap(roomName, game);
      console.log('GAME_MAP', this.regularGameService.getRoomToGameMap());

      // send playerChar to connected socket
      this.server.to(socket.id).emit('setup', {
        playerCharacter: playerChar,
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

      if (msg) {
        this.server.to(roomName).emit('gameStatus', msg);
      }
    }

    if (!game) {
      throw new Error(`issue determining game/room info for: ${socket.id}`);
    }
    console.log(`[GAME INIT | ${getTimeNow()}]: ${socket.id}`);
  }

  @SubscribeMessage('gameEnded')
  handGameEnded(@ConnectedSocket() socket: Socket): void {
    const isPlayerRemoved = this.regularGameService.removePlayerBySocketId(
      socket,
      'manual',
    );

    if (!isPlayerRemoved) {
      throw new Error(`issue disconnecting after leaving game`);
    } else {
      console.log('GAME_MAP', this.regularGameService.getRoomToGameMap());
      console.log(`[LEFT GAME | ${getTimeNow()}]: ${socket.id}`);
    }
  }

  @SubscribeMessage('broadcastGameEvent')
  handleEvent(
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
