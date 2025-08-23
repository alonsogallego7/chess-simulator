import { Injectable, signal, WritableSignal } from '@angular/core';
import { Piece } from '../models/Piece';
import { Square } from '../models/Square';
import { PieceFactory } from '../models/PieceFactory';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: WritableSignal<Square[][]> = signal([]);

  setBoard() {
    let newBoard: Square[][] = [];

    let initialPieces: string[] = ["rook","knight","bishop","queen","king","bishop","knight","rook"];

    let columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let auxIndex = 1;
    for (let row = 0; row < 8; row++) {
      let rowArray: Square[] = [];

      for (let col = 0; col < 8; col++) {
        auxIndex += 1;

        let color = auxIndex % 2 === 0 ? "square-beige" : "square-brown";
        let coordinate: [number, number] = [row, col];

        let piece: Piece | null = null;

        if (row === 0) piece = PieceFactory.createPiece("black", initialPieces[col]);
        if (row === 1) piece = PieceFactory.createPiece("black", "pawn");

        if (row === 6) piece = PieceFactory.createPiece("white", "pawn");
        if (row === 7) piece = PieceFactory.createPiece("white", initialPieces[col]);

        rowArray.push(new Square(color, coordinate, piece));
      }

      auxIndex += 1;

      newBoard.push(rowArray);
    }

    this.board.set(newBoard);
  }

  getPossibleMovesByPiece(piece: Piece): [number, number][] | null {
    let square = this.getSquareByPiece(piece);
    if (!square) return null;

    let [startRow, startCol] = square.coordinates;
    let abstractMoves = piece.getAbstractMoves();

    let possibleMoves: [number, number][] = [];

    for (let move of abstractMoves) {
      let row = startRow;
      let col = startCol;

      do {
        row += move.rowOffset;
        col += move.colOffset;

        if (row < 0 || row > 7 || col < 0 || col > 7) break;

        let targetSquare = this.board()[row][col];

        if (targetSquare.piece && targetSquare.piece.colour == piece.colour) break;

        possibleMoves.push([row, col]);

        if (targetSquare.piece && targetSquare.piece.colour != piece.colour) break;

      } while (move.repeatable);
    }

    return possibleMoves;
  }

  getSquareByPiece(piece: Piece): Square | null {
    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        const square = this.board()[row][col];
        if (square.piece === piece) {
          return square;
        }
      }
    }

    return null;
  }
}
