import { Test, TestingModule } from '@nestjs/testing';
import { RoomsManagerService } from '../src/modules/events/roomsManager.service';
import { Room } from '../src/modules/events/utils/room';
import { Game } from '../src/modules/events/utils/game';

describe('RoomsManagerService', () => {
  let service: RoomsManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsManagerService],
    }).compile();

    service = module.get<RoomsManagerService>(RoomsManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Client Count Management', () => {
    describe('incrementNumClients', () => {
      it('should increment the number of clients by 1', () => {
        const initialCount = service.getNumClients();
        service.incrementNumClients();
        expect(service.getNumClients()).toBe(initialCount + 1);
      });

      it('should increment multiple times correctly', () => {
        const initialCount = service.getNumClients();
        service.incrementNumClients();
        service.incrementNumClients();
        service.incrementNumClients();
        expect(service.getNumClients()).toBe(initialCount + 3);
      });
    });

    describe('decrementNumClients', () => {
      it('should decrement the number of clients by 1', () => {
        service.incrementNumClients();
        const countBeforeDecrement = service.getNumClients();

        service.decrementNumClients();
        expect(service.getNumClients()).toBe(countBeforeDecrement - 1);
      });

      it('should not allow decrementing below 0', () => {
        expect(() => service.decrementNumClients()).toThrow(Error);
        expect(service.getNumClients()).toBe(0);
      });

      it('should decrement multiple times correctly', () => {
        service.incrementNumClients();
        service.incrementNumClients();
        service.incrementNumClients();
        const countBeforeDecrement = service.getNumClients();

        service.decrementNumClients();
        service.decrementNumClients();

        expect(service.getNumClients()).toBe(countBeforeDecrement - 2);
      });
    });

    describe('getNumClients', () => {
      it('should return 0 for newly initialized service', () => {
        expect(service.getNumClients()).toBe(0);
      });

      it('should return correct count after multiple increments', () => {
        service.incrementNumClients();
        service.incrementNumClients();
        expect(service.getNumClients()).toBe(2);
      });
    });
  });

  describe('Room Management', () => {
    describe('getRooms', () => {
      it('should return an empty Map when no rooms exist', () => {
        expect(service.getRooms()).toEqual(new Map());
        expect(service.getRooms().size).toBe(0);
      });

      it('should return all rooms in the Map', () => {
        service.addRoom();
        service.addRoom();

        const rooms = service.getRooms();

        expect(rooms.size).toBe(2);
      });
    });

    describe('addRoom', () => {
      it('should create and store a new room', () => {
        const room = service.addRoom();

        expect(room).toBeInstanceOf(Room);
        expect(service.getRooms().size).toBe(1);
      });

      it('should create room with correct naming convention', () => {
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        const room3 = service.addRoom();

        expect(room1.name).toBe('room1');
        expect(room2.name).toBe('room2');
        expect(room3.name).toBe('room3');
      });

      it('should initialize room with a new Game instance', () => {
        const room = service.addRoom();
        expect(room.game).toBeInstanceOf(Game);
        expect(room.game.getPlayers()).toEqual([]);
      });
    });

    describe('getRoomByName', () => {
      it('should return undefined when room does not exist', () => {
        expect(service.getRoomByName('nonexistent')).toBeUndefined();
      });

      it('should return the room when it exists', () => {
        const addedRoom = service.addRoom();

        const retrievedRoom = service.getRoomByName('room1');

        expect(retrievedRoom).toBe(addedRoom);
      });

      it('should return correct room from multiple rooms', () => {
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        const room3 = service.addRoom();

        expect(service.getRoomByName('room1')).toBe(room1);
        expect(service.getRoomByName('room2')).toBe(room2);
        expect(service.getRoomByName('room3')).toBe(room3);
      });
    });

    describe('removeRoom', () => {
      it('should return false when removing non-existent room', () => {
        const result = service.removeRoom('nonexistent');
        expect(result).toBe(false);
      });

      it('should return true when successfully removing an existing room', () => {
        service.addRoom();
        const result = service.removeRoom('room1');
        expect(result).toBe(true);
      });

      it('should actually remove the room from the Map', () => {
        service.addRoom();
        service.removeRoom('room1');

        expect(service.getRoomByName('room1')).toBeUndefined();
        expect(service.getRooms().size).toBe(0);
      });

      it('should only remove the specified room', () => {
        const room1 = service.addRoom();
        const room2 = service.addRoom();

        service.removeRoom('room1');

        expect(service.getRoomByName('room1')).toBeUndefined();
        expect(service.getRoomByName('room2')).toBe(room2);
        expect(service.getRooms().size).toBe(1);
      });
    });
  });

  describe('Room Discovery', () => {
    describe('findOpenRoom', () => {
      it('should create a new room if no open rooms exist', () => {
        const room = service.findOpenRoom();

        expect(room).toBeInstanceOf(Room);
        expect(service.getRooms().size).toBe(1);
      });

      it('should return existing open room when one player is in it', () => {
        const existingRoom = service.addRoom();
        existingRoom.game.addPlayer({ socketId: 'socket1', userId: 'user1' });

        const foundRoom = service.findOpenRoom();

        expect(foundRoom).toBe(existingRoom);
        expect(service.getRooms().size).toBe(1);
      });

      it('should return first available open room when multiple exist', () => {
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        room1.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        room1.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        const foundRoom = service.findOpenRoom();

        expect(foundRoom).toBe(room2);
      });

      it('should create new room when all existing rooms are full', () => {
        const fullRoom = service.addRoom();
        fullRoom.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        fullRoom.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        const foundRoom = service.findOpenRoom();

        expect(foundRoom).not.toBe(fullRoom);
        expect(service.getRooms().size).toBe(2);
        expect(service.getRoomByName('room2')).toEqual(foundRoom);
      });

      it('should return empty room (0 players) as open', () => {
        const emptyRoom = service.addRoom();
        const foundRoom = service.findOpenRoom();
        expect(foundRoom).toBe(emptyRoom);
      });
    });

    describe('getRoomBySocketId', () => {
      it('should return null when socket ID does not exist', () => {
        const room = service.getRoomBySocketId('nonexistent');
        expect(room).toBeNull();
      });

      it('should return the room containing the player with the socket ID', () => {
        const room = service.addRoom();
        room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });

        const foundRoom = service.getRoomBySocketId('socket1');
        expect(foundRoom).toBe(room);
      });

      it('should return correct room when multiple rooms exist', () => {
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        room1.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        room2.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        expect(service.getRoomBySocketId('socket1')).toBe(room1);
        expect(service.getRoomBySocketId('socket2')).toBe(room2);
      });

      it('should return null after player is removed from game', () => {
        const room = service.addRoom();
        room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });

        room.game.removePlayerBySocketId('socket1');

        expect(service.getRoomBySocketId('socket1')).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should manage full game flow: create room, add players, find room', () => {
      const room = service.findOpenRoom();
      room.game.addPlayer({ socketId: 'p1', userId: 'user1' });
      room.game.addPlayer({ socketId: 'p2', userId: 'user2' });

      expect(service.getRoomBySocketId('p1')).toBe(room);
      expect(service.getRoomBySocketId('p2')).toBe(room);
      expect(service.findOpenRoom()).not.toBe(room);
    });

    it('should handle client disconnect flow', () => {
      const room = service.addRoom();
      room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      service.incrementNumClients();

      room.game.removePlayerBySocketId('socket1');
      service.decrementNumClients();

      expect(service.getRoomBySocketId('socket1')).toBeNull();
      expect(service.getNumClients()).toBe(0);
    });
  });
});
