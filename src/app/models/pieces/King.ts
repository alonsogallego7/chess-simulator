
import { Piece } from '../Piece';

export class King extends Piece {
  constructor(colour: "white" | "black") {
    super("king", colour);
  }
}
