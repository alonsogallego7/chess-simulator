import { Injectable, signal, WritableSignal } from '@angular/core';
import { Piece } from '../models/Piece';
import { Square } from '../models/Square';
import { PieceFactory } from '../models/PieceFactory';
import { Move } from '../models/Move';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: WritableSignal<Square[][]> = signal([]);

  setBoard() {
    let newBoard: Square[][] = [];

    let initialPieces: string[] = ["rook","knight","bishop","queen","king","bishop","knight","rook"];

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

  getValidMovesByPiece(piece: Piece | null): [number, number][] | [] {
    if (!piece) return [];

    let square = this.getSquareByPiece(piece);
    if (!square) return [];

    square.highlight = "selected";

    let [startRow, startCol] = square.coordinates;
    let abstractMoves = piece.getAbstractMoves();

    let validMoves: [number, number][] = [];

    for (let move of abstractMoves) {
      let row = startRow;
      let col = startCol;

      do {
        row += move.rowOffset;
        col += move.colOffset;

        if (row < 0 || row > 7 || col < 0 || col > 7) break;

        let targetSquare = this.board()[row][col];

        if (piece.name === "pawn") {
          if (move.colOffset === 0) {
            // Forward move
            if (targetSquare.piece) break;

            validMoves.push([row, col]);
            targetSquare.highlight = "move";
          } else {
            // Diagonal move
            if (targetSquare.piece && targetSquare.piece.colour !== piece.colour) {
              validMoves.push([row, col]);
              targetSquare.highlight = "intersect";
            }

            break;
          }
        } else {
          // Same colour piece
          if (targetSquare.piece && targetSquare.piece.colour == piece.colour) break;

          // Different colour piece
          if (targetSquare.piece && targetSquare.piece.colour !== piece.colour) {
            validMoves.push([row, col]);
            targetSquare.highlight = "intersect";
            break;
          }

          // Empty square
          validMoves.push([row, col]);
          targetSquare.highlight = "move";
        }

      } while (move.repeatable);
    }

    return validMoves;
  }

  movePiece(move: Move) {
    let [rowFrom, colFrom] = move.from;
    let [rowTo, colTo] = move.to;

    let piece = this.board()[rowFrom][colFrom].piece;
    let squareFrom = this.board()[rowFrom][colFrom];
    let squareTo = this.board()[rowTo][colTo];

    squareFrom.piece = null;
    squareTo.piece = piece;

    this.resetSquaresHighlight();

    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        let square = this.board()[row][col];
        if (square.highlight === "last-move-from" || square.highlight === "last-move-to") {
          square.highlight = "none";
        }
      }
    }

    squareFrom.highlight = "last-move-from";
    squareTo.highlight = "last-move-to";
  }

  getSquareByPiece(piece: Piece): Square | null {
    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        let square = this.board()[row][col];
        if (square.piece === piece) {
          return square;
        }
      }
    }

    return null;
  }

  resetSquaresHighlight() {
    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        let square = this.board()[row][col];
        if (square.highlight != "last-move-from" && square.highlight != "last-move-to") {
          square.highlight = "none";
        }
      }
    }
  }
}
