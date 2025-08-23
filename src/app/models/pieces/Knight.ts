import { MoveOffset } from '../../helpers/types';
import { Piece } from '../Piece';

export class Knight extends Piece {
  constructor(colour: "white" | "black") {
    super("knight", colour);
  }

  override getAbstractMoves(): MoveOffset[] {
    return [
      { rowOffset: -2, colOffset: -1, repeatable: false },
      { rowOffset: -2, colOffset: 1, repeatable: false },
      { rowOffset: -1, colOffset: -2, repeatable: false },
      { rowOffset: -1, colOffset: 2, repeatable: false },
      { rowOffset: 1, colOffset: -2, repeatable: false },
      { rowOffset: 1, colOffset: 2, repeatable: false },
      { rowOffset: 2, colOffset: -1, repeatable: false },
      { rowOffset: 2, colOffset: 1, repeatable: false }
    ];
  }
}
