import { Injectable, signal, WritableSignal } from '@angular/core';
import { Piece } from '../models/Piece';
import { Square } from '../models/Square';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: WritableSignal<Square[][]> = signal([]);

  constructor() {
    this.setBoard();
  }

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

        if (row === 0) piece = new Piece("black", initialPieces[col]);
        if (row === 1) piece = new Piece("black", "pawn");

        if (row === 6) piece = new Piece("white", "pawn");
        if (row === 7) piece = new Piece("white", initialPieces[col]);

        rowArray.push(new Square(color, coordinate, piece));
      }

      auxIndex += 1;

      newBoard.push(rowArray);
    }

    this.board.set(newBoard);
  }
}
