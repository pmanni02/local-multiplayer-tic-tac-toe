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
        // Arrange
        const initialCount = service.getNumClients();

        // Act
        service.incrementNumClients();

        // Assert
        expect(service.getNumClients()).toBe(initialCount + 1);
      });

      it('should increment multiple times correctly', () => {
        // Arrange
        const initialCount = service.getNumClients();

        // Act
        service.incrementNumClients();
        service.incrementNumClients();
        service.incrementNumClients();

        // Assert
        expect(service.getNumClients()).toBe(initialCount + 3);
      });
    });

    describe('decrementNumClients', () => {
      it('should decrement the number of clients by 1', () => {
        // Arrange
        service.incrementNumClients();
        const countBeforeDecrement = service.getNumClients();

        // Act
        service.decrementNumClients();

        // Assert
        expect(service.getNumClients()).toBe(countBeforeDecrement - 1);
      });

      it('should allow decrementing below 0', () => {
        // Act
        service.decrementNumClients();

        // Assert
        expect(service.getNumClients()).toBe(-1);
      });

      it('should decrement multiple times correctly', () => {
        // Arrange
        service.incrementNumClients();
        service.incrementNumClients();
        service.incrementNumClients();
        const countBeforeDecrement = service.getNumClients();

        // Act
        service.decrementNumClients();
        service.decrementNumClients();

        // Assert
        expect(service.getNumClients()).toBe(countBeforeDecrement - 2);
      });
    });

    describe('getNumClients', () => {
      it('should return 0 for newly initialized service', () => {
        // Assert
        expect(service.getNumClients()).toBe(0);
      });

      it('should return correct count after multiple increments', () => {
        // Act
        service.incrementNumClients();
        service.incrementNumClients();

        // Assert
        expect(service.getNumClients()).toBe(2);
      });
    });
  });

  describe('Room Management', () => {
    describe('getRooms', () => {
      it('should return an empty Map when no rooms exist', () => {
        // Assert
        expect(service.getRooms()).toEqual(new Map());
        expect(service.getRooms().size).toBe(0);
      });

      it('should return all rooms in the Map', () => {
        // Arrange
        service.addRoom();
        service.addRoom();

        // Act
        const rooms = service.getRooms();

        // Assert
        expect(rooms.size).toBe(2);
      });
    });

    describe('addRoom', () => {
      it('should create and store a new room', () => {
        // Act
        const room = service.addRoom();

        // Assert
        expect(room).toBeInstanceOf(Room);
        expect(service.getRooms().size).toBe(1);
      });

      it('should create room with correct naming convention', () => {
        // Act
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        const room3 = service.addRoom();

        // Assert
        expect(room1.name).toBe('room1');
        expect(room2.name).toBe('room2');
        expect(room3.name).toBe('room3');
      });

      it('should initialize room with a new Game instance', () => {
        // Act
        const room = service.addRoom();

        // Assert
        expect(room.game).toBeInstanceOf(Game);
        expect(room.game.getPlayers()).toEqual([]);
      });

      it('should add room to the rooms Map with its name as key', () => {
        // Act
        const room = service.addRoom();

        // Assert
        expect(service.getRoomByName('room1')).toBe(room);
      });
    });

    describe('getRoomByName', () => {
      it('should return undefined when room does not exist', () => {
        // Assert
        expect(service.getRoomByName('nonexistent')).toBeUndefined();
      });

      it('should return the room when it exists', () => {
        // Arrange
        const addedRoom = service.addRoom();

        // Act
        const retrievedRoom = service.getRoomByName('room1');

        // Assert
        expect(retrievedRoom).toBe(addedRoom);
      });

      it('should return correct room from multiple rooms', () => {
        // Arrange
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        const room3 = service.addRoom();

        // Act & Assert
        expect(service.getRoomByName('room1')).toBe(room1);
        expect(service.getRoomByName('room2')).toBe(room2);
        expect(service.getRoomByName('room3')).toBe(room3);
      });
    });

    describe('removeRoom', () => {
      it('should return false when removing non-existent room', () => {
        // Act
        const result = service.removeRoom('nonexistent');

        // Assert
        expect(result).toBe(false);
      });

      it('should return true when successfully removing an existing room', () => {
        // Arrange
        service.addRoom();

        // Act
        const result = service.removeRoom('room1');

        // Assert
        expect(result).toBe(true);
      });

      it('should actually remove the room from the Map', () => {
        // Arrange
        service.addRoom();

        // Act
        service.removeRoom('room1');

        // Assert
        expect(service.getRoomByName('room1')).toBeUndefined();
        expect(service.getRooms().size).toBe(0);
      });

      it('should only remove the specified room', () => {
        // Arrange
        const room1 = service.addRoom();
        const room2 = service.addRoom();

        // Act
        service.removeRoom('room1');

        // Assert
        expect(service.getRoomByName('room1')).toBeUndefined();
        expect(service.getRoomByName('room2')).toBe(room2);
        expect(service.getRooms().size).toBe(1);
      });
    });
  });

  describe('Room Discovery', () => {
    describe('findOpenRoom', () => {
      it('should create a new room if no open rooms exist', () => {
        // Act
        const room = service.findOpenRoom();

        // Assert
        expect(room).toBeInstanceOf(Room);
        expect(service.getRooms().size).toBe(1);
      });

      it('should return existing open room when one player is in it', () => {
        // Arrange
        const existingRoom = service.addRoom();
        existingRoom.game.addPlayer({ socketId: 'socket1', userId: 'user1' });

        // Act
        const foundRoom = service.findOpenRoom();

        // Assert
        expect(foundRoom).toBe(existingRoom);
        expect(service.getRooms().size).toBe(1);
      });

      it('should return first available open room when multiple exist', () => {
        // Arrange
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        room1.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        room1.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        // Act
        const foundRoom = service.findOpenRoom();

        // Assert
        expect(foundRoom).toBe(room2);
      });

      it('should create new room when all existing rooms are full', () => {
        // Arrange
        const fullRoom = service.addRoom();
        fullRoom.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        fullRoom.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        // Act
        const foundRoom = service.findOpenRoom();

        // Assert
        expect(foundRoom).not.toBe(fullRoom);
        expect(service.getRooms().size).toBe(2);
      });

      it('should return empty room (0 players) as open', () => {
        // Arrange
        const emptyRoom = service.addRoom();

        // Act
        const foundRoom = service.findOpenRoom();

        // Assert
        expect(foundRoom).toBe(emptyRoom);
      });
    });

    describe('getRoomBySocketId', () => {
      it('should return null when socket ID does not exist', () => {
        // Act
        const room = service.getRoomBySocketId('nonexistent');

        // Assert
        expect(room).toBeNull();
      });

      it('should return the room containing the player with the socket ID', () => {
        // Arrange
        const room = service.addRoom();
        room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });

        // Act
        const foundRoom = service.getRoomBySocketId('socket1');

        // Assert
        expect(foundRoom).toBe(room);
      });

      it('should return correct room when multiple rooms exist', () => {
        // Arrange
        const room1 = service.addRoom();
        const room2 = service.addRoom();
        room1.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        room2.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        // Act & Assert
        expect(service.getRoomBySocketId('socket1')).toBe(room1);
        expect(service.getRoomBySocketId('socket2')).toBe(room2);
      });

      it('should find the correct room when player is second in the room', () => {
        // Arrange
        const room = service.addRoom();
        room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        room.game.addPlayer({ socketId: 'socket2', userId: 'user2' });

        // Act
        const foundRoom = service.getRoomBySocketId('socket2');

        // Assert
        expect(foundRoom).toBe(room);
      });

      it('should return null after player is removed from game', () => {
        // Arrange
        const room = service.addRoom();
        room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
        
        // Act
        room.game.removePlayerBySocketId('socket1');

        // Assert
        expect(service.getRoomBySocketId('socket1')).toBeNull();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should manage full game flow: create room, add players, find room', () => {
      // Act
      const room = service.findOpenRoom();
      room.game.addPlayer({ socketId: 'p1', userId: 'user1' });
      room.game.addPlayer({ socketId: 'p2', userId: 'user2' });

      // Assert
      expect(service.getRoomBySocketId('p1')).toBe(room);
      expect(service.getRoomBySocketId('p2')).toBe(room);
      expect(service.findOpenRoom()).not.toBe(room);
    });

    it('should handle client disconnect flow', () => {
      // Arrange
      const room = service.addRoom();
      room.game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      service.incrementNumClients();

      // Act
      room.game.removePlayerBySocketId('socket1');
      service.decrementNumClients();

      // Assert
      expect(service.getRoomBySocketId('socket1')).toBeNull();
      expect(service.getNumClients()).toBe(0);
    });
  });
});
