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

const players: Record<string, string> = {};
const numPlayers = () => Object.keys(players).length;

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
  }

  handleConnection(socket: Socket) {
    if (
      numPlayers() === 0 ||
      (numPlayers() === 1 && Object.entries(players)[0][1] !== 'X')
    ) {
      players[socket.id] = 'X';
    } else {
      players[socket.id] = 'O';
    }
    const gameChar = players[socket.id];

    // send playerChar to connected socket
    this.server.to(socket.id).emit('setup', {
      playerChar: gameChar,
    });

    console.log(
      `[CONNECTED]: ${socket.id}, ${gameChar}. Total: ${numPlayers()}`,
    );
  }

  handleDisconnect(socket: Socket) {
    for (const [key] of Object.entries(players)) {
      if (key === socket.id) {
        delete players[key];
      }
    }

    console.log(`[DISCONNECTED]: ${socket.id}. Total: ${numPlayers()}`);
  }

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody()
    data: {
      squares: string[];
      status: string;
      currentPlayer: string;
    },
    @ConnectedSocket() socket: Socket,
  ): void {
    console.log(`[EVENTS]: ${JSON.stringify(data)}`);
    this.server.emit('events', {
      squares: data.squares,
      status: data.status,
      currentPlayer: data.currentPlayer,
    });
  }
}
