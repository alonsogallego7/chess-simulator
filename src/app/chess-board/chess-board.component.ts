import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-chess-board',
  imports: [],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css'
})
export class ChessBoardComponent implements OnInit{
  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService;
  }

  get board() {
    return this.gameService.board();
  }
}
