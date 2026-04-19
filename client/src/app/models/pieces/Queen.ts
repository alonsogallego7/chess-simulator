import { MoveOffset } from "../../helpers/types";
import { Piece } from "../Piece";

export class Queen extends Piece {
  constructor(colour: "white" | "black") {
    super("queen", colour);
  }

  override getAbstractMoves(): MoveOffset[] {
    return [
      { rowOffset: 1, colOffset: 0, repeatable: true },
      { rowOffset: -1, colOffset: 0, repeatable: true },
      { rowOffset: 0, colOffset: 1, repeatable: true },
      { rowOffset: 0, colOffset: -1, repeatable: true },
      { rowOffset: 1, colOffset: 1, repeatable: true },
      { rowOffset: 1, colOffset: -1, repeatable: true },
      { rowOffset: -1, colOffset: 1, repeatable: true },
      { rowOffset: -1, colOffset: -1, repeatable: true }
    ];
  }
}
