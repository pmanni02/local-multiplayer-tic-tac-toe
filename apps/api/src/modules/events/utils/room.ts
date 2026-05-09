import { Game } from './game';

export class Room {
  name: string;
  game: Game;
  private gameBoard: string[];
  private gameBoardCurrentPlayer: string;

  // Create a game everytime a new room is created
  constructor(name: string) {
    this.name = name;
    this.game = new Game();
    this.gameBoard = Array(9).fill('') as string[];
    this.gameBoardCurrentPlayer = 'X';
  }

  setGameBoard(squares: string[], currentPlayer: string): void {
    this.gameBoard = squares;
    this.gameBoardCurrentPlayer = currentPlayer;
  }

  getGameBoard(): { squares: string[]; currentPlayer: string } {
    return {
      squares: this.gameBoard,
      currentPlayer: this.gameBoardCurrentPlayer,
    };
  }

  printRoom() {
    console.log(`
      ROOM: ${this.name} 
      GAME: ${JSON.stringify(this.game)}
    `);
  }
}
