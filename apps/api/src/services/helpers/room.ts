import { Game } from './game';

export class Room {
  name: string;
  game: Game;

  // create a game everytime a new room is created
  constructor(name: string) {
    this.name = name;
    this.game = new Game();
  }

  printRoom() {
    console.log(`
      ROOM: ${this.name} 
      GAME: ${JSON.stringify(this.game)}
    `);
  }
}
