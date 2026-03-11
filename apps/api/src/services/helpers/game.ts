import { PlayerT } from 'src/types/types';
import { Player } from './player';

export class Game {
  private players: Player[];

  constructor() {
    this.players = [];
  }

  addPlayer({ socketId, userId }: Omit<PlayerT, 'gameChar'>): Player | null {
    if (this.players.length <= 1) {
      const playerChar = this.#getPlayerChar();
      const player = new Player({ socketId, gameChar: playerChar, userId });
      this.players.push(player);
      return player;
    }
    return null;
  }

  getPlayers() {
    return this.players;
  }

  removePlayerBySocketId(socketId: string) {
    this.players = this.players.filter(
      (player) => player.getPlayerInfo().socketId !== socketId,
    );
    return this.players;
  }

  playerIsInGame = (socketId: string) => {
    const player = this.players.find(
      (player) => player.getPlayerInfo().socketId === socketId,
    );
    return player ? true : false;
  };

  #getPlayerChar = (): string => {
    const numPlayers = this.players.length;
    let playerChar: string;
    if (
      numPlayers === 0 ||
      (numPlayers === 1 && this.players[0].getPlayerInfo().gameChar !== 'X')
    ) {
      playerChar = 'X';
    } else {
      playerChar = 'O';
    }
    return playerChar;
  };
}
