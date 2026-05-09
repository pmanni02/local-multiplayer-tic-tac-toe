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

  // Player Connected -> find/join room, emit roomDetermined
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
        // Get game from room, add player to room
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

        // Only emit room/char info to own client
        this.server.to(socket.id).emit('roomDetermined', {
          roomName: myRoom.name,
          playerChar: newPlayerChar,
        });

        // Join room
        void socket.join(myRoom.name);

        console.log(`[PLAYER JOINED | ${getTimeNow()}]: ${socket.id}`);
        myRoom.printRoom();
      } else {
        console.error(`socketId: ${socket.id} already in room/game`);
      }
    }
  }

  // SessionRecovery -> check if sessionId exists and recover session state
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

      // Get current game board state from room (full state, not session state)
      const currentGameState = room?.getGameBoard() || {
        squares: existingSession.squares,
        currentPlayer: existingSession.currentPlayer,
      };

      // Emit recovered session to client with current game board state
      const recoveredMessage: SessionRecoveredMessage = {
        roomName: existingSession.roomName,
        playerChar: existingSession.playerChar,
        squares: currentGameState.squares,
        currentPlayer: currentGameState.currentPlayer,
      };

      this.server.to(socket.id).emit('sessionRecovered', recoveredMessage);

      // Emit game status to the room
      if (room && room.game.getPlayers().length === 2) {
        const statusMessage: GameStatusMessage = {
          message: 'Game Ready',
        };
        this.server
          .to(existingSession.roomName)
          .emit('gameStatus', statusMessage);
      }

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

  // GameInitialized -> determine/emit gameStatus
  @SubscribeMessage('gameInitialized')
  handleGameInitialized(
    @MessageBody()
    data: GameInitializedMessage,
    @ConnectedSocket() socket: Socket,
  ): void {
    const { roomName } = data;
    const room = this.roomsManagerService.getRoomByName(roomName);

    // If there is a game and socketId is not in gameMap already, update gameMap
    if (room) {
      let msg: Nullable<GameStatusMessage> = null;
      if (room.game.getPlayers().length === 1) {
        // Emit to self (only player room)
        msg = {
          message: 'Waiting for opponent',
        };
      } else if (room.game.getPlayers().length === 2) {
        // Emit to all players in room
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

  // GameEvent -> rebroadcast to clients in room
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

    // Save game state to session and room if available
    if (sessionId) {
      this.roomsManagerService.updateSessionGameState(
        sessionId,
        squares,
        status === 'reset' ? 'X' : currentPlayer,
      );
    }

    const roomObj = this.roomsManagerService.getRoomByName(room);
    // Update the room's game board
    if (roomObj) {
      roomObj.setGameBoard(squares, status === 'reset' ? 'X' : currentPlayer);
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

  // Client disconnected -> update room object, decrement total client count
  handleDisconnect(socket: Socket): void {
    const msg = {
      message: 'Opponent Disconnected',
    };
    this.handleDisconnectEvent(msg, socket);
    console.log(`[DISCONNECTED | ${getTimeNow()}]: ${socket.id}`);

    this.roomsManagerService.decrementNumClients();
  }

  // Client left room -> update room object
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
    if (!room) return;

    const disconnectedPlayer = room.game
      .getPlayers()
      .find((player) => player.getPlayerInfo().socketId === socket.id);

    const remainingPlayers = room.game
      .getPlayers()
      .filter((player) => player.getPlayerInfo().socketId !== socket.id);

    const sessionId = disconnectedPlayer?.getPlayerInfo().sessionId;
    const hasSession = sessionId
      ? this.roomsManagerService.getSession(sessionId)
      : undefined;

    if (hasSession) {
      // Preserve disconnected player in the game for reconnect
      if (remainingPlayers.length === 1) {
        const opponentSocketId = remainingPlayers[0].getPlayerInfo().socketId;
        if (msg) this.server.to(opponentSocketId).emit('gameStatus', msg);
      }
      room.printRoom();
      return;
    }

    room.game.removePlayerBySocketId(socket.id);
    const updatedPlayers = room.game.getPlayers();

    if (updatedPlayers.length === 1) {
      const opponentSocketId = updatedPlayers[0].getPlayerInfo().socketId;
      if (msg) this.server.to(opponentSocketId).emit('gameStatus', msg);
      room.printRoom();
    }
  }
}
