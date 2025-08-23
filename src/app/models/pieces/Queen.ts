import { Piece } from "../Piece";

export class Queen extends Piece {
  constructor(colour: "white" | "black") {
    super("queen", colour);
  }
}
