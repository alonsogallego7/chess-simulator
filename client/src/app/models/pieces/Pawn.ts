import { MoveOffset } from '../../helpers/types';
import { Piece } from '../Piece';

export class Pawn extends Piece {
  constructor(colour: "white" | "black") {
    super("pawn", colour);
  }

  override getAbstractMoves(): MoveOffset[] {
    if(this.colour == "white") {
      return [
        { rowOffset: -1, colOffset: 0, repeatable: false },
        { rowOffset: -2, colOffset: 0, repeatable: false },
        { rowOffset: -1, colOffset: -1, repeatable: false },
        { rowOffset: -1, colOffset: 1, repeatable: false },
      ];
    } else {
      return [
        { rowOffset: 1, colOffset: 0, repeatable: false },
        { rowOffset: 2, colOffset: 0, repeatable: false },
        { rowOffset: 1, colOffset: -1, repeatable: false },
        { rowOffset: 1, colOffset: 1, repeatable: false },
      ];
    }
  }
}
