import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameService } from '../services/game.service';
import { BoardService } from '../services/board.service';
import { Square } from '../models/Square';
import { PieceFactory } from '../models/PieceFactory';
import { Move } from '../models/Move';
import { HistoryService } from '../services/history.service';
import { algebraicToIndex } from '../helpers/chess.utils';

interface PieceSnapshot { name: string; colour: 'white' | 'black'; hasMoved: boolean; }
interface SquareSnapshot { squareColorClass: string; piece: PieceSnapshot | null; }
interface GameSnapshot {
  board: SquareSnapshot[][];
  currentTurnColour: 'white' | 'black';
  isCheck: boolean;
  checkAttackLine: [number, number][];
  isGameOver: boolean;
  gameOverReason: string;
  halfMoveClock: number;
  lastMove: Move | null;
  movesHistory: Move[];
}

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
  historyService = inject(HistoryService);

  historySent = signal<boolean>(false);

  fromRow = signal<number | null>(null);
  fromCol = signal<number | null>(null);
  toRow = signal<number | null>(null);
  toCol = signal<number | null>(null);



  movesInput = signal<string>('');
  simulationDelayMs = signal<number>(500);
  isSimulating = signal<boolean>(false);

  // --- Random simulation ---
  randomSimDelayMs = signal<number>(400);
  isRandomSimulating = signal<boolean>(false);
  snapshots = signal<GameSnapshot[]>([]);
  canUndo = computed(() => this.snapshots().length > 0 && !this.isRandomSimulating());

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
      alert('Invalid coordinates (must be between 0 and 7)');
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
    const wasEnabled = this.gameService.stockfishEnabled;
    const colour = this.gameService.stockfishColour;
    const depth = this.gameService.stockfishDepth;
    
    this.boardService.setBoard();
    this.gameService.stockfishEnabled = wasEnabled;
    this.gameService.stockfishColour = colour;
    this.gameService.stockfishDepth = depth;
    this.gameService.startGame();
    this.historySent.set(false);
  }

  toggleStockfish(enabled: boolean) {
    this.gameService.stockfishEnabled = enabled;
    if (enabled && this.gameService.currentTurnPlayer.colour === this.gameService.stockfishColour && !this.gameService.isGameOver) {
      this.gameService.triggerStockfishMove();
    }
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
      
      const [fr, fc] = algebraicToIndex(moveStr.substring(0, 2));
      const [tr, tc] = algebraicToIndex(moveStr.substring(2, 4));
      
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

  // ---------- Snapshot helpers ----------

  private saveSnapshot() {
    const board = this.boardService.board();
    const snap: GameSnapshot = {
      board: board.map(row =>
        row.map(sq => ({
          squareColorClass: sq.squareColorClass,
          piece: sq.piece
            ? { name: sq.piece.name, colour: sq.piece.colour, hasMoved: sq.piece.hasMoved }
            : null
        }))
      ),
      currentTurnColour: this.gameService.currentTurnPlayer.colour as 'white' | 'black',
      isCheck: this.gameService.isCheck,
      checkAttackLine: this.gameService.checkAttackLine.map(c => [...c] as [number, number]),
      isGameOver: this.gameService.isGameOver,
      gameOverReason: this.gameService.gameOverReason,
      halfMoveClock: this.gameService.halfMoveClock,
      lastMove: this.boardService.lastMove
        ? { ...this.boardService.lastMove, from: [...this.boardService.lastMove.from] as [number, number], to: [...this.boardService.lastMove.to] as [number, number] }
        : null,
      movesHistory: this.gameService.movesHistory.map(m => ({ ...m, from: [...m.from] as [number, number], to: [...m.to] as [number, number] })),
    };
    this.snapshots.update(prev => [...prev, snap]);
  }

  undoLastMove() {
    const snaps = this.snapshots();
    if (snaps.length === 0) return;

    const snap = snaps[snaps.length - 1];
    this.snapshots.update(prev => prev.slice(0, -1));

    // Rebuild board from snapshot
    const newBoard = snap.board.map((row, r) =>
      row.map((sq, c) => {
        const square = new Square(sq.squareColorClass, [r, c], null);
        if (sq.piece) {
          const piece = PieceFactory.createPiece(sq.piece.colour, sq.piece.name);
          piece.hasMoved = sq.piece.hasMoved;
          square.piece = piece;
        }
        return square;
      })
    );
    this.boardService.board.set(newBoard);

    // Restore game state
    this.gameService.isCheck = snap.isCheck;
    this.gameService.checkAttackLine = snap.checkAttackLine;
    this.gameService.isGameOver = snap.isGameOver;
    this.gameService.gameOverReason = snap.gameOverReason;
    this.gameService.halfMoveClock = snap.halfMoveClock;
    this.gameService.selectedSquare = null;
    this.gameService.selectedPieceValidMoves = [];
    this.boardService.lastMove = snap.lastMove ? { ...snap.lastMove } : null;
    this.gameService.movesHistory = snap.movesHistory.map(m => ({ ...m }));

    const [p1, p2] = this.gameService['playerService'].getPlayers();
    this.gameService.currentTurnPlayer = snap.currentTurnColour === p1.colour ? p1 : p2;

    this.boardService.resetSquaresHighlight();
  }

  // ---------- Random simulation ----------

  /** Returns a random legal move for the current player as [fromSquare, toSquare], or null if none. */
  private getRandomMove(): [import('../models/Square').Square, import('../models/Square').Square] | null {
    const board = this.boardService.board();
    const colour = this.gameService.currentTurnPlayer.colour;
    const isCheck = this.gameService.isCheck;
    const checkLine = this.gameService.checkAttackLine;

    // Collect all legal moves
    const allMoves: [import('../models/Square').Square, import('../models/Square').Square][] = [];

    for (const row of board) {
      for (const square of row) {
        if (square.piece?.colour !== colour) continue;

        const validMoves = isCheck
          ? this.boardService.getValidMovesToDefendCheckByPiece(checkLine, square.piece)
          : this.boardService.getValidMovesByPiece(square.piece);

        for (const [r, c] of validMoves) {
          allMoves.push([square, board[r][c]]);
        }
      }
    }

    if (allMoves.length === 0) return null;
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  /** Execute exactly one random legal move. */
  nextRandomMove() {
    if (this.gameService.isGameOver) return;
    const move = this.getRandomMove();
    if (!move) return;
    this.saveSnapshot();
    const [from, to] = move;
    this.gameService.handleSquareClick(from);
    this.gameService.handleSquareClick(to);
  }

  /** Auto-play random moves until game over or stopped. */
  async simulateRandomGame() {
    if (this.isRandomSimulating()) return;
    this.isRandomSimulating.set(true);

    while (this.isRandomSimulating() && !this.gameService.isGameOver) {
      const move = this.getRandomMove();
      if (!move) break;
      this.saveSnapshot();
      const [from, to] = move;
      this.gameService.handleSquareClick(from);
      this.gameService.handleSquareClick(to);
      await new Promise(res => setTimeout(res, this.randomSimDelayMs()));
    }

    this.isRandomSimulating.set(false);
  }

  stopRandomSimulation() {
    this.isRandomSimulating.set(false);
  }

  resetRandomSimulation() {
    this.isRandomSimulating.set(false);
    this.snapshots.set([]);
    
    const wasEnabled = this.gameService.stockfishEnabled;
    const colour = this.gameService.stockfishColour;
    const depth = this.gameService.stockfishDepth;
    
    this.boardService.setBoard();
    this.gameService.stockfishEnabled = wasEnabled;
    this.gameService.stockfishColour = colour;
    this.gameService.stockfishDepth = depth;
    this.gameService.startGame();
    this.historySent.set(false);
  }

  sendHistory() {
    if (!this.gameService.isGameOver) return;
    
    let winner: string | null = null;
    if (this.gameService.gameOverReason.includes('White wins')) {
      winner = 'white';
    } else if (this.gameService.gameOverReason.includes('Black wins')) {
      winner = 'black';
    }
    
    const isDraw = this.gameService.gameOverReason.includes('Draw');

    const payload = {
      moves: this.gameService.movesHistory,
      winnerColor: winner,
      isDraw: isDraw
    };

    this.historyService.sendGameHistory(payload).subscribe({
      next: () => this.historySent.set(true),
      error: (e) => console.error("Error sending history", e)
    });
  }
}
