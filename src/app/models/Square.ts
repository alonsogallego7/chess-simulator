import { Piece } from "./Piece";

export class Square {
  // CSS
  squareClass: string;
  squareColorClass: string;
  highlight: "none" | "selected" | "last-move-from" | "last-move-to" | "move" | "intersect" | "check" | "debug";

  // Game
  coordinates: [number, number];
  piece: Piece | null;

  constructor(squareColorClass: string, coordinates: [number, number], piece: Piece | null) {
    this.squareClass = 'square';
    this.squareColorClass = squareColorClass;
    this.highlight = "none";

    this.coordinates = coordinates;

    this.piece = piece;
  }
}