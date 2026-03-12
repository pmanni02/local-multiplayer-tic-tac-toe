import { OptionalPlayerT, PlayerT } from 'src/types/types';

export class Player {
  private socketId: string;
  private gameChar: string;
  private userId: string;

  constructor({ socketId, gameChar, userId }: PlayerT) {
    this.gameChar = gameChar;
    this.socketId = socketId;
    this.userId = userId;
  }

  setPlayerInfo({ socketId, gameChar, userId }: OptionalPlayerT) {
    if (socketId) this.socketId = socketId;
    if (gameChar) this.gameChar = gameChar;
    if (userId) this.userId = userId;
  }

  getPlayerInfo(): PlayerT {
    return {
      socketId: this.socketId,
      gameChar: this.gameChar,
      userId: this.userId,
    };
  }
}
