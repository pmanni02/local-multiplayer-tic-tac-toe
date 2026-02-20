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

const players: Record<string, SocketInfo> = {};
const numPlayers = () => Object.keys(players).length;

@WebSocketGateway({ cors: true })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit() {
    console.log('Websocket server initialized!');
  }

  // On connection, determine room and player char
  handleConnection(socket: Socket) {
    const tempDefaultRoom = 'room1';
    if (
      numPlayers() === 0 ||
      (numPlayers() === 1 && Object.entries(players)[0][1].playerChar !== 'X')
    ) {
      players[socket.id] = { playerChar: 'X', roomName: tempDefaultRoom };
    } else {
      players[socket.id] = { playerChar: 'O', roomName: tempDefaultRoom };
    }
    console.log(
      `[CONNECTED]: ${socket.id}, char: ${players[socket.id].playerChar}, room: ${players[socket.id].roomName}`,
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
    this.server.emit('events', {
      squares: data.squares,
      status: data.status,
      currentPlayer: data.currentPlayer,
      room: data.room,
    });
  }
}
