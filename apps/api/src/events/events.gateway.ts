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

const clients: Record<string, Socket> = {};
const numClients = (clientsObj: Record<string, Socket>) =>
  Object.keys(clientsObj).length;

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
  }

  handleConnection(client: Socket) {
    clients[client.id] = client;

    let gameChar: string;
    if (numClients(clients) <= 1) {
      gameChar = 'X';
    } else {
      gameChar = 'O';
    }

    // send playerChar to connected client
    this.server.to(client.id).emit('setup', {
      playerChar: gameChar,
    });

    console.log(
      `[CONNECTED]: ${client.id}, ${gameChar}. Total: ${numClients(clients)}`,
    );
  }

  handleDisconnect(client: Socket) {
    for (const [key] of Object.entries(clients)) {
      if (key === client.id) {
        delete clients[key];
      }
    }

    console.log(`[DISCONNECTED]: ${client.id}. Total: ${numClients(clients)}`);
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
