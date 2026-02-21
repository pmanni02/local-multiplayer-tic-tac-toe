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

const GAME_MAP: Map<string, Game> = new Map();

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
    const gameMap = this.regularGameService.getGameMap();
    // determine roomName, get open room OR create new room
    let roomName: string;
    const openRooms = this.regularGameService.getOpenRoomName();
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = this.regularGameService.addRoom('regular');
    }

    // get game using roomName, either existing or new game
    const game = this.regularGameService.getGameMap().get(roomName);
    if (game) {
      const playerChar = this.regularGameService.getPlayerChar(game);
      game.numPlayers += 1;
      game.playerSocketInfo[socket.id] = playerChar;
      console.log('GAME_MAP', gameMap);

      // join room
      void socket.join(roomName);

      // check if player needs an opponent
      if (game.numPlayers === 1) {
        this.server.to(socket.id).emit('gameStatus', {
          message: 'Waiting for opponent',
          status: 'pendingGame',
        });
      } else if (game.numPlayers === 2) {
        this.server.emit('gameStatus', {
          message: 'Game Ready',
          status: 'ready',
        });
      }

      console.log(
        `[CONNECTED]: ${socket.id}, char: ${playerChar}, room: ${roomName}`,
      );
    } else {
      throw new Error(`issue determine game/room info for: ${socket.id}`);
    }
  }

  handleDisconnect(socket: Socket) {
    const roomAndGameInfo =
      this.regularGameService.getRoomAndGameInfoBySocketId(socket.id);
    if (roomAndGameInfo) {
      const { roomName, game } = roomAndGameInfo;
      delete game.playerSocketInfo[socket.id];
      const updatedGame: Game = {
        ...game,
        numPlayers: game.numPlayers - 1,
        playerSocketInfo: game.playerSocketInfo,
      };

      // if there is still a player, notify other player of disconnect
      if (updatedGame.numPlayers === 1) {
        const opponentSocketId = Object.keys(updatedGame.playerSocketInfo)[0];
        console.log('opponentSocketId', opponentSocketId);
        this.server.to(opponentSocketId).emit('gameStatus', {
          message: 'Opponent Disconnected',
          status: 'pendingGame',
        });
      } else if (updatedGame.numPlayers === 0) {
        // delete room
        this.regularGameService.getGameMap().delete(roomName);
      }

      this.regularGameService.getGameMap().set(roomName, updatedGame);
      console.log('GAME_MAP', this.regularGameService.getGameMap());
      console.log(`[DISCONNECTED]: ${socket.id}`);
    } else {
      throw new Error(`issue disconnecting socket w/ id: ${socket.id}`);
    }
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const roomAndGameInfo =
      this.regularGameService.getRoomAndGameInfoBySocketId(socket.id);
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
