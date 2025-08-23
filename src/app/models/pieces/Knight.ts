import { Piece } from '../Piece';

export class Knight extends Piece {
  constructor(colour: "white" | "black") {
    super("knight", colour);
  }
}
