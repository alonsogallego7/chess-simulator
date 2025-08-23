import { inject, Injectable } from '@angular/core';
import { PlayerService } from './player.service';
import { BoardService } from './board.service';
import { Player } from '../models/Player';

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
}
