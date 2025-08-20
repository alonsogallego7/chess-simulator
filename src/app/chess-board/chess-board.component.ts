import { Component, OnInit } from '@angular/core';
import { BoardService } from '../services/board.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chess-board',
  imports: [NgClass],
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css'
})
export class ChessBoardComponent implements OnInit{
  constructor(private boardService: BoardService) {}

  ngOnInit(): void {

  }

  get board() {
    return this.boardService.board();
  }
}
