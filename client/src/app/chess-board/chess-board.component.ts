import { Component, inject, OnInit, computed } from '@angular/core';
import { BoardService } from '../services/board.service';
import { NgClass } from '@angular/common';
import { PlayerService } from '../services/player.service';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-chess-board',
  imports: [NgClass],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css'
})
export class ChessBoardComponent implements OnInit{
  boardService = inject(BoardService);
  playerService = inject(PlayerService)
  gameService = inject(GameService);

  ngOnInit(): void {
    this.boardService.setBoard();
    this.playerService.setPlayers("Alonso", "Stockfish");

    this.gameService.stockfishEnabled = true;
    this.gameService.stockfishColour = 'black';
    this.gameService.startGame();
  }

  /** Returns the board with rows/cols reversed when flipped — same Square references, so clicks still work. */
  displayBoard = computed(() => {
    const b = this.boardService.board();
    if (this.boardService.boardFlipped()) {
      return [...b].reverse().map(row => [...row].reverse());
    }
    return b;
  });

  leftCapturedPieces = computed(() => {
    return this.boardService.boardFlipped() ? this.capturedByWhite() : this.capturedByBlack();
  });

  leftCapturedImgPrefix = computed(() => {
    return this.boardService.boardFlipped() ? 'black' : 'white';
  });

  rightCapturedPieces = computed(() => {
    return this.boardService.boardFlipped() ? this.capturedByBlack() : this.capturedByWhite();
  });

  rightCapturedImgPrefix = computed(() => {
    return this.boardService.boardFlipped() ? 'white' : 'black';
  });

  capturedByWhite = computed(() => {
    return this.gameService.movesHistory()
      .filter(m => m.color === 'white' && m.capturedPieceName)
      .map(m => m.capturedPieceName!);
  });

  capturedByBlack = computed(() => {
    return this.gameService.movesHistory()
      .filter(m => m.color === 'black' && m.capturedPieceName)
      .map(m => m.capturedPieceName!);
  });
}
