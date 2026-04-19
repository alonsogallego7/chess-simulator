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
    this.playerService.setPlayers("Alonso", "Luis");

    this.gameService.startGame();
  }

  get board() {
    return this.boardService.board();
  }
}
