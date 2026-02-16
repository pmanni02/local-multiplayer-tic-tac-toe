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

  handleConnection(client: Socket) {
    if (
      numPlayers() === 0 ||
      (numPlayers() === 1 && Object.entries(players)[0][1] !== 'X')
    ) {
      players[client.id] = 'X';
    } else {
      players[client.id] = 'O';
    }
    const gameChar = players[client.id];

    // send playerChar to connected client
    this.server.to(client.id).emit('setup', {
      playerChar: gameChar,
    });

    console.log(
      `[CONNECTED]: ${client.id}, ${gameChar}. Total: ${numPlayers()}`,
    );
  }

  handleDisconnect(client: Socket) {
    for (const [key] of Object.entries(players)) {
      if (key === client.id) {
        delete players[key];
      }
    }

    console.log(`[DISCONNECTED]: ${client.id}. Total: ${numPlayers()}`);
  }

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody()
    data: {
      squares: string[];
      status: string;
    },
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`[EVENTS]: ${JSON.stringify(data)}`);
    this.server.emit('events', {
      squares: data.squares,
      status: data.status,
    });
  }
}
