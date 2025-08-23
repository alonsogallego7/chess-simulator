import { Piece } from "../Piece";

export class Rook extends Piece {
  constructor(colour: "white" | "black") {
    super("rook", colour);
  }
}
