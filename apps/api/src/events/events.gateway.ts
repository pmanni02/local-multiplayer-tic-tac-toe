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
import { Game, RegularGameService } from 'src/services/regularGame.service';

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

  // TODO: handle reconnection logic
  handleConnection(socket: Socket) {
    console.log(`[CONNECTED | ${getTimeNow()}]: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    const isPlayerRemoved = this.regularGameService.removePlayerBySocketId(
      socket,
      'disconnect',
    );

    console.log('GAME_MAP', this.regularGameService.getGameMap());
    console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    // determine roomName, get open room OR create new room
    let roomName: string;
    const openRooms = this.regularGameService.getOpenRoomName();
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = this.regularGameService.addRoom('regular');
    }
    const gameMap = this.regularGameService.getGameMap();
    console.log('GAME_MAP', gameMap);

    // join room
    void socket.join(roomName);

    this.server.to(roomName).emit('roomDetermined', {
      roomName,
    });
    console.log(`[ROOM      | ${getTimeNow()}]: ${socket.id}, ${roomName}`);
  }

  @SubscribeMessage('gameInitialized')
  handleGameInitialized(
    @MessageBody()
    data: {
      roomName: string;
    },
    @ConnectedSocket() socket: Socket,
  ): void {
    const { roomName } = data;
    const game = this.regularGameService.getGameMap().get(roomName);
    if (
      game &&
      !this.regularGameService.getRoomAndGameInfoBySocketId(socket.id)
    ) {
      const playerChar = this.regularGameService.getPlayerChar(game);
      game.numPlayers += 1;
      game.playerSocketInfo[socket.id] = playerChar;

      this.regularGameService.getGameMap().set(roomName, game);
      const gameMap = this.regularGameService.getGameMap();
      console.log('GAME_MAP', gameMap);

      // send playerChar to connected socket
      this.server.to(socket.id).emit('setup', {
        playerCharacter: playerChar,
      });

      // check if player needs an opponent
      if (game.numPlayers === 1) {
        // emit to self
        this.server.to(roomName).emit('gameStatus', {
          message: 'Waiting for opponent',
          status: 'pendingGame',
        });
      } else if (game.numPlayers === 2) {
        // emit to all players in room
        this.server.to(roomName).emit('gameStatus', {
          message: 'Game Ready',
          status: 'ready',
        });
      }
    }

    if (!game) {
      throw new Error(`issue determine game/room info for: ${socket.id}`);
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
    }

    console.log('GAME_MAP', this.regularGameService.getGameMap());
    console.log(`[LEFT GAME | ${getTimeNow()}]: ${socket.id}`);
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
  ): void {
    this.server.to(data.room).emit('events', {
      squares: data.squares,
      status: data.status,
      currentPlayer: data.currentPlayer,
    });
  }
}
