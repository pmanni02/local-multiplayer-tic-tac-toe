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
  type GameInitializedMessage,
  type SessionRecoveryMessage,
  type SessionRecoveredMessage,
  GameStatusMessage,
  Nullable,
} from '@repo/shared-types';
import { Server, Socket } from 'socket.io';
import { gameTie, gameWon } from '../game/game.utils';
import { RoomsManagerService } from './roomsManager.service';
import { getTimeNow } from '../../utils';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private roomsManagerService: RoomsManagerService) {}
  @WebSocketServer() server!: Server;

  afterInit() {
    console.log('Websocket server initialized!');
    this.roomsManagerService = new RoomsManagerService();
  }

  // client connected -> increment total client count
  handleConnection(socket: Socket): void {
    const sessionId = socket.handshake.query.sessionId as string;
    console.log(
      `[CONNECTED | ${getTimeNow()}]: ID: ${socket.id}, sessionId: ${sessionId}`,
    );
    this.roomsManagerService.incrementNumClients();
  }

  // playerConnected -> find/join room, emit roomDetermined
  @SubscribeMessage('playerConnected')
  handlePlayerConnected(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: {
      sessionId: string;
    },
  ): void {
    const room = this.roomsManagerService.getRoomById('socketId', socket.id);
    if (!room) {
      const myRoom = this.roomsManagerService.findOpenRoom();

      if (!myRoom.game.playerIsInGame(socket.id)) {
        // get game from room, add player to room
        const myGame = myRoom.game;
        const newPlayer = myGame.addPlayer({
          socketId: socket.id,
          sessionId: data.sessionId,
        });
        const newPlayerChar = newPlayer?.getPlayerInfo().gameChar;

        // Save session info
        this.roomsManagerService.saveSession(
          data.sessionId,
          socket.id,
          myRoom.name,
          newPlayerChar || 'X',
          Array(9).fill('') as string[],
          'X',
        );

        // only emit room/char info to own client
        this.server.to(socket.id).emit('roomDetermined', {
          roomName: myRoom.name,
          playerChar: newPlayerChar,
        });

        // join room
        void socket.join(myRoom.name);

        console.log(`[PLAYER JOINED | ${getTimeNow()}]: ${socket.id}`);
        myRoom.printRoom();
      } else {
        console.error(`socketId: ${socket.id} already in room/game`);
      }
    }
  }

  // sessionRecovery -> check if sessionId exists and recover session state
  @SubscribeMessage('sessionRecovery')
  handleSessionRecovery(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    data: Record<string, string>,
  ): void {
    const { sessionId } = data;
    const existingSession = this.roomsManagerService.getSession(sessionId);

    if (existingSession) {
      // Update socketId to new connection
      this.roomsManagerService.updateSessionSocketId(sessionId, socket.id);

      // Update the game instance with new socketId
      const room = this.roomsManagerService.getRoomByName(
        existingSession.roomName,
      );
      if (room) {
        room.game.updatePlayerSocketId(sessionId, socket.id);
        console.log(
          `[GAME UPDATED]: Player ${sessionId} socketId updated to ${socket.id}`,
        );
      }

      // Join the room
      void socket.join(existingSession.roomName);

      // Emit recovered session to client
      const recoveredMessage: SessionRecoveredMessage = {
        roomName: existingSession.roomName,
        playerChar: existingSession.playerChar,
        squares: existingSession.squares,
        currentPlayer: existingSession.currentPlayer,
      };

      this.server.to(socket.id).emit('sessionRecovered', recoveredMessage);

      console.log(
        `[SESSION RECOVERED | ${getTimeNow()}]: sessionId: ${sessionId}, oldSocketId: ${existingSession.socketId}, newSocketId: ${socket.id}`,
      );
    } else {
      this.server.to(socket.id).emit('sessionRecoveryFailed', {
        message: 'Session not found',
      });

      console.log(
        `[SESSION RECOVERY FAILED | ${getTimeNow()}]: sessionId: ${sessionId} not found`,
      );
    }
  }

  // gameInitialized -> determine/emit gameStatus
  @SubscribeMessage('gameInitialized')
  handleGameInitialized(
    @MessageBody()
    data: GameInitializedMessage,
    @ConnectedSocket() socket: Socket,
  ): void {
    const { roomName } = data;
    const room = this.roomsManagerService.getRoomByName(roomName);

    // if there is a game and socketId is not in gameMap already, update gameMap
    if (room) {
      let msg: Nullable<GameStatusMessage> = null;
      if (room.game.getPlayers().length === 1) {
        // emit to self (only player room)
        msg = {
          message: 'Waiting for opponent',
        };
      } else if (room.game.getPlayers().length === 2) {
        // emit to all players in room
        msg = {
          message: 'Game Ready',
        };
      }
      if (msg) this.server.to(roomName).emit('gameStatus', msg);
    } else {
      throw new Error(`issue determining game/room info for: ${socket.id}`);
    }
  }

  // --------------------------------------------------------------------

  // gameEvent -> rebroadcast to clients in room
  @SubscribeMessage('gameEvent')
  handleBroadcastGameEvent(
    @MessageBody()
    data: {
      squares: string[];
      socketId: string;
      currentPlayer: string;
      room: string;
      status: string;
      sessionId?: string;
    },
  ): void {
    const { squares, socketId, room, status, currentPlayer, sessionId } = data;

    // Save game state to session if available
    if (sessionId) {
      this.roomsManagerService.updateSessionGameState(
        sessionId,
        squares,
        status === 'reset' ? 'X' : currentPlayer,
      );
    }

    // RESET
    if (status === 'reset') {
      const eventsMessage: EventsMessageToClient = {
        squares,
        currentPlayer: 'X', // default to 'X' player
      };
      this.server.to(room).emit('gameEvent', eventsMessage);
      return;
    }

    // WIN OR TIE
    if (gameWon(squares)) {
      this.server
        .to(socketId)
        .emit('gameEnd', { message: 'YOU WIN!', squares });
      this.server
        .to(room)
        .except(socketId)
        .emit('gameEnd', { message: 'YOU LOSE!', squares });
      return;
    } else if (gameTie(squares)) {
      this.server.to(room).emit('gameEnd', { message: 'TIE!', squares });
      return;
    }

    // DEFAULT
    const eventsMessage: EventsMessageToClient = {
      squares,
      currentPlayer,
    };
    this.server.to(room).emit('gameEvent', eventsMessage);
  }

  // --------------------------------------------------------------------

  // client disconnected -> update room object, decrement total client count
  handleDisconnect(socket: Socket): void {
    const msg = {
      message: 'Opponent Disconnected',
    };
    this.handleDisconnectEvent(msg, socket);
    console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);

    this.roomsManagerService.decrementNumClients();
  }

  // client left room -> update room object
  @SubscribeMessage('clientDisconnected')
  handGameEnded(@ConnectedSocket() socket: Socket): void {
    const room = this.roomsManagerService.getRoomById('socketId', socket.id);
    const msg = {
      message: 'Opponent Left Game',
    };
    this.handleDisconnectEvent(msg, socket);
    console.log(`[PLAYER LEFT | ${getTimeNow()}]: ${socket.id}`);

    room?.printRoom();
  }

  private handleDisconnectEvent(msg: Record<string, string>, socket: Socket) {
    const room = this.roomsManagerService.getRoomById('socketId', socket.id);
    room?.game.removePlayerBySocketId(socket.id);
    const remainingPlayers = room?.game.getPlayers();

    if (remainingPlayers && remainingPlayers.length === 1) {
      const opponentSocketId = remainingPlayers[0].getPlayerInfo().socketId;
      if (msg) socket.to(opponentSocketId).emit('gameStatus', msg);
      room?.printRoom();
    }
  }
}
