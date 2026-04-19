
import { MoveOffset } from '../../helpers/types';
import { Piece } from '../Piece';

export class King extends Piece {
  constructor(colour: "white" | "black") {
    super("king", colour);
  }

  override getAbstractMoves(): MoveOffset[] {
    return [
      { rowOffset: -1, colOffset: 0, repeatable: false },
      { rowOffset: 1, colOffset: 0, repeatable: false },
      { rowOffset: 0, colOffset: -1, repeatable: false },
      { rowOffset: 0, colOffset: 1, repeatable: false },
      { rowOffset: -1, colOffset: -1, repeatable: false },
      { rowOffset: -1, colOffset: 1, repeatable: false },
      { rowOffset: 1, colOffset: -1, repeatable: false },
      { rowOffset: 1, colOffset: 1, repeatable: false },
    ];
  }
}
