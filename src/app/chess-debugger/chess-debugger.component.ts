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



  movesInput = signal<string>('');
  simulationDelayMs = signal<number>(500);
  isSimulating = signal<boolean>(false);

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

  resetGame() {
    this.boardService.setBoard();
    this.gameService.startGame();
  }

  parseCoordinate(coord: string): [number, number] {
    const col = coord.charCodeAt(0) - 97; // 'a' is 97
    const row = 8 - parseInt(coord[1], 10);
    return [row, col];
  }

  async simulateMoves() {
    if (this.isSimulating()) return;
    
    // Allow commas, newlines, tabs or multiple spaces
    const movesList = this.movesInput().split(/[\s,]+/).filter(m => m.trim().length === 4);
    if (movesList.length === 0) {
      alert("No valid moves found. Use format 'e2e4 e7e5' or 'e2e4,e7e5'");
      return;
    }

    this.isSimulating.set(true);
    for (const moveStr of movesList) {
      if (!this.isSimulating()) break; // Stop Simulation early
      
      const [fr, fc] = this.parseCoordinate(moveStr.substring(0, 2));
      const [tr, tc] = this.parseCoordinate(moveStr.substring(2, 4));
      
      const fromSquare = this.boardService.board()[fr][fc];
      const toSquare = this.boardService.board()[tr][tc];

      if (!fromSquare || !toSquare) {
        alert(`Invalid square computed from ${moveStr}: [${fr},${fc}] -> [${tr},${tc}]`);
        break;
      }

      this.gameService.handleSquareClick(fromSquare);
      this.gameService.handleSquareClick(toSquare);

      await new Promise(res => setTimeout(res, this.simulationDelayMs()));
    }
    this.isSimulating.set(false);
  }

  stopSimulation() {
    this.isSimulating.set(false);
  }
}
