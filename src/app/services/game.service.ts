import { Injectable, signal, WritableSignal } from '@angular/core';
import { Piece } from '../models/Piece';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  board: WritableSignal<Piece[][]> = signal([]);

  constructor() {
    this.setBoard();
  }

  setBoard() {
    const newBoard: Piece[][] = [];

    for (let row = 0; row < 8; row++) {
      const rowArray: Piece[] = [];
      for (let col = 0; col < 8; col++) {
        rowArray.push(new Piece("", "")); // piezas vacías
      }
      newBoard.push(rowArray);
    }

    this.board.set(newBoard); // Actualizamos la señal
  }
}
