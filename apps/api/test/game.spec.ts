import { Player } from '../src/modules/events/utils/player';
import { Game } from '../src/modules/events/utils/game';

describe('Game', () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  describe('addPlayer', () => {
    test('it should add a player to a game', () => {
      const playersBefore = game.getPlayers();
      expect(playersBefore.length).toEqual(0);
      game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      expect(playersBefore.length).toEqual(1);
    });

    test('it should return null if game already has two players', () => {
      game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      game.addPlayer({ socketId: 'socket1', userId: 'user2' });

      expect(() =>
        game.addPlayer({
          socketId: 'socket1',
          userId: 'user2',
        }),
      ).toThrow(Error);
    });

    test('it should add player with char X if game has no players', () => {
      const player1 = game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      const player1Char = player1?.getPlayerInfo().gameChar;
      expect(player1Char).toEqual('X');
    });

    test('it should add player with char O if game has single player', () => {
      const player1 = game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      const player1Char = player1?.getPlayerInfo().gameChar;
      expect(player1Char).toEqual('X');

      const player2 = game.addPlayer({ socketId: 'socket2', userId: 'user2' });
      const player2Char = player2?.getPlayerInfo().gameChar;
      expect(player2Char).toEqual('O');
    });

    test('it should add player with char X if game already has player with playerChar O', () => {
      const player1 = game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      const player2 = game.addPlayer({ socketId: 'socket2', userId: 'user2' });
      const player1Char = player1?.getPlayerInfo().gameChar;
      const player2Char = player2?.getPlayerInfo().gameChar;

      expect(player1Char).toEqual('X');
      expect(player2Char).toEqual('O');

      game.removePlayerBySocketId('socket1');
      expect(game.getPlayers().length).toEqual(1);

      const player3 = game.addPlayer({ socketId: 'socket3', userId: 'user3' });
      const player3Char = player3?.getPlayerInfo().gameChar;
      expect(player3Char).toEqual('X');
    });
  });

  describe('getPlayers', () => {
    test('it should get array of Players', () => {
      game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      const players = game.getPlayers();
      expect(players.length).toEqual(1);
      players.forEach((player) => expect(player).toBeInstanceOf(Player));
    });

    test('it should return empty array if there are no players', () => {
      const players = game.getPlayers();
      expect(players.length).toEqual(0);
    });
  });

  describe('removePlayerBySocketId', () => {
    test('it should successfully remove a player by socket id', () => {
      game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      const players = game.getPlayers();
      expect(players.length).toEqual(1);

      game.removePlayerBySocketId('socket1');
      const updatedPlayers = game.getPlayers();
      expect(updatedPlayers.length).toEqual(0);
    });

    test('it should throw an error if player with socket id not found', () => {
      expect(() => game.removePlayerBySocketId('socket1')).toThrow(Error);
    });

    test('it should throw an error if socket id is empty string', () => {
      expect(() => game.removePlayerBySocketId('')).toThrow(Error);
    });
  });

  describe('playerIsInGame', () => {
    test('it should return true if player is in game', () => {
      game.addPlayer({ socketId: 'socket1', userId: 'user1' });
      expect(game.playerIsInGame('socket1')).toEqual(true);
    });

    test('it should return false if player is not in game', () => {
      expect(game.playerIsInGame('socket1')).toEqual(false);
    });

    test('it should return false if socketId is empty string', () => {
      expect(game.playerIsInGame('')).toEqual(false);
    });
  });
});
