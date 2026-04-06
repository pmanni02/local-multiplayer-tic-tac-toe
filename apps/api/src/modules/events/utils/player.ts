import { OptionalPlayerT, PlayerT } from 'src/types/types';

export class Player {
  private socketId: string;
  private gameChar: string;
  private sessionId: string;

  constructor({ socketId, gameChar, sessionId }: PlayerT) {
    this.gameChar = gameChar;
    this.socketId = socketId;
    this.sessionId = sessionId;
  }

  setPlayerInfo({ socketId, gameChar, sessionId }: OptionalPlayerT) {
    if (socketId) this.socketId = socketId;
    if (gameChar) this.gameChar = gameChar;
    if (sessionId) this.sessionId = sessionId;
    return {
      socketId: this.socketId,
      gameChar: this.gameChar,
      sessionId: this.sessionId,
    };
  }

  getPlayerInfo(): PlayerT {
    return {
      socketId: this.socketId,
      gameChar: this.gameChar,
      sessionId: this.sessionId,
    };
  }
}
