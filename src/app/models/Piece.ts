import { MoveOffset } from "../helpers/types";

export abstract class Piece {
  name: string;
  colour: "white" | "black";
  selectable: boolean;

  constructor(name: string, colour: "white" | "black") {
    this.name = name;
    this.colour = colour;
    this.selectable = true;
  }

  abstract getAbstractMoves(): MoveOffset[];
}
