import { MoveOffset } from "../helpers/types";

export abstract class Piece {
  name: string;
  colour: "white" | "black";

  constructor(name: string, colour: "white" | "black") {
    this.name = name;
    this.colour = colour;
  }

  abstract getAbstractMoves(): MoveOffset[];
}
