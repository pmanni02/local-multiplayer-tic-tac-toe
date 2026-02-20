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

type SocketInfo = {
  playerChar: string;
  roomName: string;
};

type Game = {
  numPlayers: number;
  playerSocketIds: string[];
  gameType: string;
};

let ROOM_ID = 1;
const GAME_MAP: Map<string, Game> = new Map();

// TODO: merge GAME_MAP and players
const players: Record<string, SocketInfo> = {};
const numPlayers = () => Object.keys(players).length;

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
  }

  // On connection, determine room and player char
  handleConnection(socket: Socket) {
    const roomName = `room${ROOM_ID}`;
    if (
      numPlayers() === 0 ||
      (numPlayers() === 1 && Object.entries(players)[0][1].playerChar !== 'X')
    ) {
      players[socket.id] = { playerChar: 'X', roomName: roomName };
    } else {
      players[socket.id] = { playerChar: 'O', roomName: roomName };
    }

    // check for existing game

    const game = GAME_MAP.get(roomName);

    // game exists but room is not full
    if (game && game.numPlayers <= 1) {
      const updatedGame = {
        ...game,
        numPlayers: game.numPlayers + 1,
        playerSocketIds: [...game.playerSocketIds, socket.id],
      };
      GAME_MAP.set(roomName, updatedGame);
      ROOM_ID += 1;
    } else {
      const newGame: Game = {
        gameType: 'regular',
        playerSocketIds: [socket.id],
        numPlayers: 1,
      };
      GAME_MAP.set(roomName, newGame);
    }

    console.log('GAME_MAP', GAME_MAP);

    // join room
    void socket.join(roomName);

    console.log(
      `[CONNECTED]: ${socket.id}, char: ${players[socket.id].playerChar}, room: ${players[socket.id].roomName}`,
    );
  }

  handleDisconnect(socket: Socket) {
    // TODO: update to handle new GAME_MAP
    for (const [key] of Object.entries(players)) {
      if (key === socket.id) {
        delete players[key];
      }
    }

    console.log(`[DISCONNECTED]: ${socket.id}. Total: ${numPlayers()}`);
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const { playerChar, roomName } = players[socket.id];

    // send playerChar to connected socket
    this.server.to(socket.id).emit('setup', {
      playerCharacter: playerChar,
      room: roomName,
    });

    console.log(`[PLAYER INFO EMITTED]: ${socket.id}`);
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
