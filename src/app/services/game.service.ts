import { inject, Injectable } from '@angular/core';
import { PlayerService } from './player.service';
import { BoardService } from './board.service';
import { Player } from '../models/Player';
import { Square } from '../models/Square';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  boardService = inject(BoardService);
  playerService = inject(PlayerService);

  currentTurnPlayer: Player;

  startGame() {
    this.currentTurnPlayer = this.playerService.getPlayerByColour("white");
  }

  nextTurn() {
    let [player1, player2] = this.playerService.getPlayers();
    this.currentTurnPlayer = this.currentTurnPlayer === player1 ? player2 : player1;
  }

  handleSquareClick(square: Square) {
    if (square.piece) {
      if (square.piece.colour === this.currentTurnPlayer.colour) {
        this.boardService.getValidMovesByPiece(square.piece);
      }
    }
  }
}
