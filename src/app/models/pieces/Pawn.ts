import { Piece } from '../Piece';

export class Pawn extends Piece {
  constructor(colour: "white" | "black") {
    super("pawn", colour);
  }
}
