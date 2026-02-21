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

// type SocketInfo = {
//   playerChar: string;
//   roomName: string;
// };

type Game = {
  numPlayers: number;
  // playerSocketIds: string[];
  playerSocketInfo: Record<string, string>; // {socketId: playerChar}
  gameType: string;
};

const GAME_MAP: Map<string, Game> = new Map();
const getNumRooms = () => GAME_MAP.size;
const getOpenRoomName = (): string[] => {
  const roomInfo = [...GAME_MAP].filter(([roomName, game]) => {
    return game.numPlayers <= 1;
  });

  if (roomInfo.length) {
    return roomInfo.map(([name, game]) => name);
  }
  return [];
};

const addRoom = (gameType: string): string => {
  const newGame = {
    numPlayers: 0,
    playerSocketInfo: {},
    gameType,
  };

  const numRooms = getNumRooms();
  const newRoomName = `room${numRooms + 1}`;
  GAME_MAP.set(newRoomName, newGame);
  return newRoomName;
};

const getNumPlayersInRoom = (roomName: string): number | null => {
  const game = GAME_MAP.get(roomName);
  return game ? game.numPlayers : null;
};

const getRoomAndGameInfoBySocketId = (
  socketId: string,
): { roomName: string; game: Game } | null => {
  const room = [...GAME_MAP].find(([roomName, game]) => {
    const socketIds = Object.entries(game.playerSocketInfo).map(
      ([id, char]) => id,
    );
    return socketIds.includes(socketId);
  });

  if (room) {
    const [name, game] = room;
    return {
      roomName: name,
      game,
    };
  }
  return null;
};

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
    // determine roomName, get open room OR create new room
    let roomName: string;
    const openRooms = getOpenRoomName();
    // console.log('openRooms', openRooms);
    if (openRooms.length > 0) {
      roomName = openRooms[0];
    } else {
      roomName = addRoom('regular');
    }
    // console.log('roomName', roomName);

    // get game using roomName, either existing or new game
    const game = GAME_MAP.get(roomName);
    // console.log('game', game);
    const numPlayers = game?.numPlayers;
    // console.log('numPlayers', numPlayers);

    // set player char based off number of players in game
    let playerChar: string;
    if (
      numPlayers === 0 ||
      (numPlayers === 1 && Object.entries(game!.playerSocketInfo)[0][1] !== 'X')
    ) {
      playerChar = 'X';
    } else {
      playerChar = 'O';
    }
    game!.numPlayers += 1;
    game!.playerSocketInfo[socket.id] = playerChar;
    console.log('GAME_MAP', GAME_MAP);

    // join room
    void socket.join(roomName);

    console.log(
      `[CONNECTED]: ${socket.id}, char: ${playerChar}, room: ${roomName}`,
    );
  }

  handleDisconnect(socket: Socket) {
    const roomAndGameInfo = getRoomAndGameInfoBySocketId(socket.id);
    if (roomAndGameInfo) {
      const { roomName, game } = roomAndGameInfo;
      delete game.playerSocketInfo[socket.id];
      const updatedGame: Game = {
        ...game,
        numPlayers: game.numPlayers - 1,
        playerSocketInfo: game.playerSocketInfo,
      };
      GAME_MAP.set(roomName, updatedGame);
      console.log('GAME_MAP', GAME_MAP);
      console.log(`[DISCONNECTED]: ${socket.id}`);
    } else {
      throw new Error(`issue disconnecting socket w/ id: ${socket.id}`);
    }
  }

  @SubscribeMessage('playerConnected')
  handlePlayerConnected(@ConnectedSocket() socket: Socket): void {
    const roomAndGameInfo = getRoomAndGameInfoBySocketId(socket.id);
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
