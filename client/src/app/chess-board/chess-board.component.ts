import { Component, inject, OnInit } from '@angular/core';
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

  get board() {
    return this.boardService.board();
  }

  get capturedByWhite() {
    return this.gameService.movesHistory
      .filter(m => m.color === 'white' && m.capturedPieceName)
      .map(m => m.capturedPieceName!);
  }

  get capturedByBlack() {
    return this.gameService.movesHistory
      .filter(m => m.color === 'black' && m.capturedPieceName)
      .map(m => m.capturedPieceName!);
  }
}
