import { inject, Injectable } from '@angular/core';
import { PlayerService } from './player.service';
import { BoardService } from './board.service';
import { Player } from '../models/Player';
import { Square } from '../models/Square';
import { Piece } from '../models/Piece';
import { Move } from '../models/Move';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  boardService = inject(BoardService);
  playerService = inject(PlayerService);

  currentTurnPlayer: Player;

  selectedSquare: Square | null = null
  selectedPieceValidMoves: [number, number][] = [];

  movesHistory: Move[] = []

  startGame() {
    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];
    this.movesHistory = [];

    this.currentTurnPlayer = this.playerService.getPlayerByColour("white");
  }

  nextTurn() {
    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];

    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];

    let [player1, player2] = this.playerService.getPlayers();
    this.currentTurnPlayer = this.currentTurnPlayer === player1 ? player2 : player1;

    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];
  }

  handleSquareClick(square: Square) {
    this.boardService.resetSquaresHighlight();
    
    // Same colour piece
    if (square.piece?.colour === this.currentTurnPlayer.colour) {
      this.selectedSquare = square;
      this.selectedPieceValidMoves = this.boardService.getValidMovesByPiece(square.piece);
      return;
    }

    // Move
    if (this.selectedSquare) {
      if (square.piece) {
        this.handlePieceCapture(square);
      } else {
        this.handlePieceMove(square);
      }
    }
  }

  handlePieceMove(square: Square) {
    if (!square.piece) {
      if (
        this.selectedPieceValidMoves?.some(
          ([row, col]) => row === square.coordinates[0] && col === square.coordinates[1]
        )
      ) {
        let move = new Move(this.selectedSquare!.coordinates, square.coordinates);
        this.boardService.movePiece(move);

        this.movesHistory.push(move);

        this.nextTurn();
      }
    }
  }

  handlePieceCapture(square: Square) {
    if (
      square.piece &&
      square.piece.colour !== this.currentTurnPlayer.colour &&
      this.selectedPieceValidMoves?.some(
        ([row, col]) => row === square.coordinates[0] && col === square.coordinates[1]
      )
    ) {
      square.piece = null;

      let move = new Move(this.selectedSquare!.coordinates, square.coordinates);
      this.boardService.movePiece(move);

      this.nextTurn();
    }
  }
}
