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
        let coordinate = `${columns[col]}${8 - row}`;

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
}
