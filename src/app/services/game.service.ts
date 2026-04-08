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

  movesHistory: Move[] = [];

  isCheck: boolean = false;
  checkAttackLine: [number, number][] = [];

  isGameOver: boolean = false;
  gameOverReason: string = '';
  halfMoveClock: number = 0;

  castlingKeyPositionsMap = new Map<[number, number], string>([
    [[7,6], "white"],
    [[7,2], "white"],
    [[0,6], "black"],
    [[0,2], "black"],
  ])

  startGame() {
    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];
    this.movesHistory = [];

    this.isGameOver = false;
    this.gameOverReason = '';
    this.halfMoveClock = 0;

    this.currentTurnPlayer = this.playerService.getPlayerByColour("white");
  }

  nextTurn() {
    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];

    let [player1, player2] = this.playerService.getPlayers();
    this.currentTurnPlayer = this.currentTurnPlayer === player1 ? player2 : player1;

    this.checkEndgameConditions();
  }

  handleSquareClick(square: Square) {
    if (this.isGameOver) return;

    this.boardService.resetSquaresHighlight();

    // Same colour piece
    if (square.piece?.colour === this.currentTurnPlayer.colour) {
      this.selectedSquare = square;
      if (this.isCheck == true) {
        this.selectedPieceValidMoves = this.boardService.getValidMovesToDefendCheckByPiece(this.checkAttackLine, square.piece);
      } else {
        this.selectedPieceValidMoves = this.boardService.getValidMovesByPiece(square.piece);
      }

      this.boardService.highlightMoves(this.selectedSquare, this.selectedPieceValidMoves);

      return;
    }

    // Move
    if (
      this.selectedSquare &&
      this.selectedPieceValidMoves.some(([r, c]) =>
        r === square.coordinates[0] &&
        c === square.coordinates[1]
      )
    ) {
      // square is the destination square in this case
      if (square.piece) {
        this.handlePieceCapture(square);
      } else {
        if (this.selectedSquare!.piece!.name == "king") {
          this.handleCastling(square);
        } else {
          this.handlePieceMove(square);
        }
      }

      this.selectedSquare = square;
      this.selectedPieceValidMoves = this.boardService.getValidMovesByPiece(square.piece);

      this.handleCheck();

      this.nextTurn();
    }
  }

  handlePieceMove(square: Square) {
    if (!square.piece) {
      if (
        this.selectedPieceValidMoves?.some(
          ([row, col]) => row === square.coordinates[0] && col === square.coordinates[1]
        )
      ) {
        let pieceMovedInfo = this.selectedSquare!.piece;
        let move = new Move(this.selectedSquare!.coordinates, square.coordinates);
        this.boardService.movePiece(move);

        this.movesHistory.push(move);

        if (pieceMovedInfo?.name === "pawn") {
          this.halfMoveClock = 0;
        } else {
          this.halfMoveClock++;
        }
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
      this.halfMoveClock = 0;
    }
  }

  handleCheck() {
    let kingSquare = this.boardService.getKingSquare(this.currentTurnPlayer.colour == "white" ? "black" : "white");

    if (this.selectedPieceValidMoves.some(
      ([r, c]) =>
        r === kingSquare!.coordinates[0] &&
        c === kingSquare!.coordinates[1]
      )
    ) {
      this.boardService.highlightCheck(kingSquare!);

      this.isCheck = true;
      this.checkAttackLine = this.boardService.getSquaresBetweenPieces(this.selectedSquare, kingSquare);
    } else {
      this.isCheck = false;
    }
  }

  handleCastling(destinationSquare: Square) {
    let [r, c] = destinationSquare.coordinates;

    let matchedEntry = Array.from(this.castlingKeyPositionsMap.entries()).find(
        ([[kr, kc], value]) => kr === r && kc === c && value === this.currentTurnPlayer.colour
    );

    if (matchedEntry) {
        let [key, value] = matchedEntry; // key = [kr, kc], value = color
        this.boardService.castle(key); // pasamos la key que coincidió
    }
  }

  checkEndgameConditions() {
    if (this.halfMoveClock >= 100) {
      this.isGameOver = true;
      this.gameOverReason = "Empate (Regla de los 50 movimientos)";
      return;
    }

    if (this.hasInsufficientMaterial()) {
      this.isGameOver = true;
      this.gameOverReason = "Empate (Insuficiencia de material)";
      return;
    }

    let hasAnyValidMove = false;
    for (let row of this.boardService.board()) {
      for (let square of row) {
        if (square.piece?.colour === this.currentTurnPlayer.colour) {
          let validMoves = this.isCheck ? 
            this.boardService.getValidMovesToDefendCheckByPiece(this.checkAttackLine, square.piece) :
            this.boardService.getValidMovesByPiece(square.piece);
          
          if (validMoves.length > 0) {
            hasAnyValidMove = true;
            break;
          }
        }
      }
      if (hasAnyValidMove) break;
    }

    if (!hasAnyValidMove) {
      this.isGameOver = true;
      if (this.isCheck) {
        this.gameOverReason = "Jaque Mate! Gana " + (this.currentTurnPlayer.colour === "white" ? "Negras" : "Blancas");
      } else {
        this.gameOverReason = "Empate (Ahogado / Stalemate)";
      }
    }
  }

  hasInsufficientMaterial(): boolean {
    let pieces: Piece[] = [];
    for (let row of this.boardService.board()) {
      for (let square of row) {
        if (square.piece) pieces.push(square.piece);
      }
    }
    
    if (pieces.length === 2) return true; // Solo reyes
    
    if (pieces.length === 3) {
      if (pieces.some(p => p.name === 'knight' || p.name === 'bishop')) {
        return true; 
      }
    }
    return false;
  }
}
