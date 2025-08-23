import { Piece } from "../Piece";

export class Bishop extends Piece {
  constructor(colour: "white" | "black") {
    super("bishop", colour);
  }
}
