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

    console.log(
      `Client: ${client.id} connected. Total: ${numClients(clients)}`,
    );
  }

  handleDisconnect(client: Socket) {
    for (const [key] of Object.entries(clients)) {
      if (key === client.id) {
        delete clients[key];
      }
    }

    console.log(
      `Client: ${client.id} disconnected. Total: ${numClients(clients)}`,
    );
  }

  @SubscribeMessage('events')
  handleEvent(
    // @MessageBody() data: number,
    @MessageBody() data: { index: number; char: string },
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`received: ${JSON.stringify(data)}, broadcasting...`);
    this.server.emit('events', {
      // message: data,
      index: data.index,
      char: data.char,
      senderSocketId: client.id,
    });
  }
}
