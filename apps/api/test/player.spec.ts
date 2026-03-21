import { Player } from '../src/modules/events/utils/player';

describe('player', () => {
  describe('setPlayerInfo', () => {
    test('it should update existing player socketId', () => {
      const player = new Player({
        socketId: 'socket1',
        gameChar: 'X',
        userId: 'user1',
      });
      const updatedPlayer = player.setPlayerInfo({ socketId: 'socket2' });
      expect(updatedPlayer.socketId).toEqual('socket2');
      expect(updatedPlayer.gameChar).toEqual('X');
      expect(updatedPlayer.userId).toEqual('user1');
    });

    test('it should update existing player gameChar', () => {
      const player = new Player({
        socketId: 'socket1',
        gameChar: 'X',
        userId: 'user1',
      });
      const updatedPlayer = player.setPlayerInfo({ gameChar: 'O' });
      expect(updatedPlayer.socketId).toEqual('socket1');
      expect(updatedPlayer.gameChar).toEqual('O');
      expect(updatedPlayer.userId).toEqual('user1');
    });

    test('it should update existing player userId', () => {
      const player = new Player({
        socketId: 'socket1',
        gameChar: 'X',
        userId: 'user1',
      });
      const updatedPlayer = player.setPlayerInfo({ userId: 'user2' });
      expect(updatedPlayer.socketId).toEqual('socket1');
      expect(updatedPlayer.gameChar).toEqual('X');
      expect(updatedPlayer.userId).toEqual('user2');
    });

    test('it should update all existing player properties', () => {
      const player = new Player({
        socketId: 'socket1',
        gameChar: 'X',
        userId: 'user1',
      });
      const updatedPlayer = player.setPlayerInfo({
        socketId: 'socket2',
        gameChar: 'O',
        userId: 'user3',
      });
      expect(updatedPlayer.socketId).toEqual('socket2');
      expect(updatedPlayer.gameChar).toEqual('O');
      expect(updatedPlayer.userId).toEqual('user3');
    });
  });

  describe('getPlayerInfo', () => {
    test('it should get player info for existing player', () => {
      const player = new Player({
        socketId: 'socket1',
        gameChar: 'X',
        userId: 'user1',
      });
      expect(player.getPlayerInfo()).toEqual({
        socketId: 'socket1',
        gameChar: 'X',
        userId: 'user1',
      });
    });
  });
});
