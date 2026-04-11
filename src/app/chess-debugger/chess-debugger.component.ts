import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';
import { BoardService } from '../services/board.service';
import { Square } from '../models/Square';

@Component({
  selector: 'app-chess-debugger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chess-debugger.component.html',
  styleUrl: './chess-debugger.component.css'
})
export class ChessDebuggerComponent {
  gameService = inject(GameService);
  boardService = inject(BoardService);

  fromRow = signal<number | null>(null);
  fromCol = signal<number | null>(null);
  toRow = signal<number | null>(null);
  toCol = signal<number | null>(null);

  selectedInfo = signal<any>(null);

  constructor() {
    effect(() => {
      // Clear previous debug highlights
      this.boardService.clearDebugHighlights();
      
      // Highlight new ones
      const fr = this.fromRow();
      const fc = this.fromCol();
      const tr = this.toRow();
      const tc = this.toCol();

      if (fr !== null && fc !== null) this.boardService.setDebugHighlight(fr, fc);
      if (tr !== null && tc !== null) this.boardService.setDebugHighlight(tr, tc);
    });
  }

  executeMove() {
    const fr = this.fromRow();
    const fc = this.fromCol();
    const tr = this.toRow();
    const tc = this.toCol();

    if (fr === null || fc === null || tr === null || tc === null ||
        fr < 0 || fr > 7 || fc < 0 || fc > 7 ||
        tr < 0 || tr > 7 || tc < 0 || tc < 7) {
      alert('Coordenadas inválidas (deben estar entre 0 y 7)');
      return;
    }
    const fromSquare = this.boardService.board()[fr][fc];
    const toSquare = this.boardService.board()[tr][tc];

    // Programmatically select square
    this.gameService.handleSquareClick(fromSquare);
    // Programmatically move
    this.gameService.handleSquareClick(toSquare);
  }

  inspectSquare(row: number, col: number) {
    const square = this.boardService.board()[row][col];
    if (square) {
      this.selectedInfo.set({
        coordinates: square.coordinates,
        piece: square.piece ? {
          name: square.piece.name,
          colour: square.piece.colour,
          hasMoved: square.piece.hasMoved,
          validMoves: this.boardService.getValidMovesByPiece(square.piece)
        } : null,
        highlight: square.highlight
      });
    }
  }

  resetGame() {
    this.boardService.setBoard();
    this.gameService.startGame();
  }
}
