import { Piece } from "./Piece";
import { Bishop } from "./pieces/Bishop";
import { King } from "./pieces/King";
import { Knight } from "./pieces/Knight";
import { Pawn } from "./pieces/Pawn";
import { Queen } from "./pieces/Queen";
import { Rook } from "./pieces/Rook";

export class PieceFactory {
  static createPiece(colour: "white" | "black", type: string): Piece {
    switch (type) {
      case "pawn": return new Pawn(colour);
      case "rook": return new Rook(colour);
      case "knight": return new Knight(colour);
      case "bishop": return new Bishop(colour);
      case "queen": return new Queen(colour);
      case "king": return new King(colour);
      default: throw new Error("Unknown piece type: " + type);
    }
  }
}