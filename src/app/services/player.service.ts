import { inject, Injectable } from '@angular/core';
import { Player } from '../models/Player';
import { BoardService } from './board.service';
import { Piece } from '../models/Piece';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  boardService = inject(BoardService);

  players: Player[];

  setPlayers(name1: string, name2: string) {
    this.players = [
      new Player(name1, "white"),
      new Player(name2, "black")
    ];
  }

  getPlayerPieces(player: Player): Piece[] {
    let pieces = [];

    for (const row of this.boardService.board()) {
      for (const square of row) {
        if (square.piece?.colour == player.colour) {
          pieces.push(square.piece);
        }
      }
    }

    return pieces;
  }
}
