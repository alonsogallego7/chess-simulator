import { Piece } from "./Piece";

export class Square {
  // CSS
  squareClass: string;
  squareColorClass: string;

  // Game
  coordinates: string;
  piece: Piece | null;

  constructor(squareColorClass: string, coordinates: string, piece: Piece | null) {
    this.squareClass = 'square';
    this.squareColorClass = squareColorClass;

    this.coordinates = coordinates;

    this.piece = piece;
  }
}