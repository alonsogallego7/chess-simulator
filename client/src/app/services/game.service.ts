import { inject, Injectable } from '@angular/core';
import { PlayerService } from './player.service';
import { BoardService } from './board.service';
import { StockfishService } from './stockfish.service';
import { Player } from '../models/Player';
import { Square } from '../models/Square';
import { Piece } from '../models/Piece';
import { Move } from '../models/Move';
import { algebraicToIndex } from '../helpers/chess.utils';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  boardService = inject(BoardService);
  playerService = inject(PlayerService);
  stockfishService = inject(StockfishService);

  currentTurnPlayer: Player;

  selectedSquare: Square | null = null
  selectedPieceValidMoves: [number, number][] = [];

  movesHistory: Move[] = [];

  isCheck: boolean = false;
  checkAttackLine: [number, number][] = [];

  isGameOver: boolean = false;
  gameOverReason: string = '';
  halfMoveClock: number = 0;

  promotionPending: boolean = false;
  promotionSquare: Square | null = null;
  promotionMove: Move | null = null;

  // Stockfish AI
  stockfishEnabled: boolean = false;
  stockfishColour: 'white' | 'black' = 'black';
  stockfishDepth: number = 12;
  stockfishThinking: boolean = false;
  stockfishLastEval: number | null = null;

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
    this.boardService.lastMove = null;

    this.isGameOver = false;
    this.gameOverReason = '';
    this.halfMoveClock = 0;
    this.isCheck = false;
    this.checkAttackLine = [];
    this.promotionPending = false;
    this.promotionSquare = null;
    this.promotionMove = null;
    this.stockfishThinking = false;
    this.stockfishLastEval = null;

    this.currentTurnPlayer = this.playerService.getPlayerByColour("white");

    // If Stockfish plays white, trigger immediately
    if (this.stockfishEnabled && this.stockfishColour === 'white') {
      this.triggerStockfishMove();
    }
  }

  nextTurn() {
    if (this.promotionPending) return;

    this.selectedSquare = null;
    this.selectedPieceValidMoves = [];

    let [player1, player2] = this.playerService.getPlayers();
    this.currentTurnPlayer = this.currentTurnPlayer === player1 ? player2 : player1;

    this.checkEndgameConditions();

    // Trigger Stockfish if it's the AI's turn
    if (
      this.stockfishEnabled &&
      !this.isGameOver &&
      this.currentTurnPlayer.colour === this.stockfishColour
    ) {
      this.triggerStockfishMove();
    }
  }

  handleSquareClick(square: Square) {
    if (this.isGameOver || this.promotionPending || this.stockfishThinking) return;

    // Block human clicks when it's Stockfish's turn
    if (this.stockfishEnabled && this.currentTurnPlayer.colour === this.stockfishColour) return;

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
        const piece = this.selectedSquare!.piece!;
        if (piece.name === "king" && Math.abs(this.selectedSquare!.coordinates[1] - square.coordinates[1]) === 2) {
          this.handleCastling(square);
        } else if (piece.name === "pawn" && this.selectedSquare!.coordinates[1] !== square.coordinates[1]) {
          this.handleEnPassant(square);
        } else {
          this.handlePieceMove(square);
        }
      }

      if (this.promotionPending) {
        return;
      }

      this.finishTurn(square);
    }
  }

  finishTurn(square: Square) {
    this.selectedSquare = square;
    this.selectedPieceValidMoves = this.boardService.getValidMovesByPiece(square.piece);

    this.handleCheck();
    this.nextTurn();
  }

  completePromotion(pieceName: string) {
    if (!this.promotionPending || !this.promotionSquare || !this.promotionMove) return;

    this.boardService.promotePawn(this.promotionSquare, pieceName);
    this.promotionMove.promotionTo = pieceName;

    this.promotionPending = false;
    let finishSq = this.promotionSquare;
    this.promotionSquare = null;
    this.promotionMove = null;

    this.finishTurn(finishSq);
  }

  handlePieceMove(square: Square) {
    if (!square.piece) {
      if (
        this.selectedPieceValidMoves?.some(
          ([row, col]) => row === square.coordinates[0] && col === square.coordinates[1]
        )
      ) {
        let pieceMovedInfo = this.selectedSquare!.piece;
        let isPromotion = pieceMovedInfo?.name === "pawn" && (square.coordinates[0] === 0 || square.coordinates[0] === 7);

        let move: Move = {
          from: this.selectedSquare!.coordinates,
          to: square.coordinates,
          color: this.currentTurnPlayer.colour,
          pieceName: pieceMovedInfo!.name,
          moveType: isPromotion ? 'promotion' : 'move',
          promotionTo: isPromotion ? 'queen' : null
        };
        this.boardService.movePiece(move);

        this.boardService.lastMove = move;
        move.colorMoveNumber = Math.floor(this.movesHistory.length / 2) + 1;
        this.movesHistory.push(move);

        if (pieceMovedInfo?.name === "pawn") {
          this.halfMoveClock = 0;
          if (isPromotion) {
            this.promotionPending = true;
            this.promotionSquare = square;
            this.promotionMove = move;
          }
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
      let capturedName = square.piece.name;
      square.piece = null;

      let pieceMovedInfo = this.selectedSquare!.piece;
      let isPromotion = pieceMovedInfo?.name === "pawn" && (square.coordinates[0] === 0 || square.coordinates[0] === 7);

      let move: Move = {
        from: this.selectedSquare!.coordinates,
        to: square.coordinates,
        color: this.currentTurnPlayer.colour,
        pieceName: pieceMovedInfo!.name,
        moveType: isPromotion ? 'promotion' : 'capture',
        capturedPieceName: capturedName,
        promotionTo: isPromotion ? 'queen' : null
      };
      this.boardService.movePiece(move);
      
      this.boardService.lastMove = move;
      move.colorMoveNumber = Math.floor(this.movesHistory.length / 2) + 1;
      this.movesHistory.push(move);
      this.halfMoveClock = 0;

      if (isPromotion) {
        this.promotionPending = true;
        this.promotionSquare = square;
        this.promotionMove = move;
      }
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
      // Ensure the attacker itself is considered a blockable/capturable square!
      this.checkAttackLine.push(this.selectedSquare!.coordinates);
    } else {
      this.isCheck = false;
      this.checkAttackLine = [];
    }
  }

  handleCastling(destinationSquare: Square) {
    this.boardService.castle(destinationSquare.coordinates, this.currentTurnPlayer.colour);
    let move: Move = {
      from: this.selectedSquare!.coordinates,
      to: destinationSquare.coordinates,
      color: this.currentTurnPlayer.colour,
      pieceName: 'king',
      moveType: 'castling'
    };
    this.boardService.lastMove = move;
    move.colorMoveNumber = Math.floor(this.movesHistory.length / 2) + 1;
    this.movesHistory.push(move);
    this.halfMoveClock++;
  }

  handleEnPassant(square: Square) {
    let move: Move = {
      from: this.selectedSquare!.coordinates,
      to: square.coordinates,
      color: this.currentTurnPlayer.colour,
      pieceName: 'pawn',
      moveType: 'en-passant',
      capturedPieceName: 'pawn'
    };
    this.boardService.movePiece(move);

    let backRow = this.selectedSquare!.coordinates[0];
    let targCol = square.coordinates[1];
    this.boardService.board()[backRow][targCol].piece = null;

    this.boardService.lastMove = move;
    move.colorMoveNumber = Math.floor(this.movesHistory.length / 2) + 1;
    this.movesHistory.push(move);
    this.halfMoveClock = 0;
  }

  checkEndgameConditions() {
    if (this.halfMoveClock >= 100) {
      this.isGameOver = true;
      this.gameOverReason = "Draw (50-move rule)";
      return;
    }

    if (this.hasInsufficientMaterial()) {
      this.isGameOver = true;
      this.gameOverReason = "Draw (Insufficient material)";
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
        this.gameOverReason = "Checkmate! " + (this.currentTurnPlayer.colour === "white" ? "Black" : "White") + " wins";
      } else {
        this.gameOverReason = "Draw (Stalemate)";
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

  // ─── Stockfish AI ───────────────────────────────────────

  /**
   * Queries the Stockfish API and executes the best move on the board.
   */
  async triggerStockfishMove() {
    if (this.isGameOver || this.stockfishThinking) return;

    this.stockfishThinking = true;

    try {
      const fullMoveNumber = Math.floor(this.movesHistory.length / 2) + 1;
      const fen = this.boardService.generateFEN(
        this.currentTurnPlayer.colour as 'white' | 'black',
        this.halfMoveClock,
        fullMoveNumber
      );

      const response = await this.stockfishService.getBestMove(fen, this.stockfishDepth);

      if (!response || !response.move) {
        console.error('Stockfish API returned no move', response);
        this.stockfishThinking = false;
        return;
      }

      this.stockfishLastEval = response.eval;

      // Parse move string: "e2e4" or "b7b8q" (promotion)
      const moveStr = response.move;
      const fromAlg = moveStr.substring(0, 2);
      const toAlg = moveStr.substring(2, 4);
      const promotionChar = moveStr.length > 4 ? moveStr[4] : null;

      const [fromRow, fromCol] = algebraicToIndex(fromAlg);
      const [toRow, toCol] = algebraicToIndex(toAlg);

      const fromSquare = this.boardService.board()[fromRow][fromCol];
      const toSquare = this.boardService.board()[toRow][toCol];

      if (!fromSquare?.piece) {
        console.error(`Stockfish move invalid: no piece at ${fromAlg} [${fromRow},${fromCol}]`);
        this.stockfishThinking = false;
        return;
      }

      // Add a small delay so the user can see the move
      await new Promise(resolve => setTimeout(resolve, 400));

      // Programmatically select and move
      this.stockfishThinking = false; // Temporarily disable to allow handleSquareClick
      const savedEnabled = this.stockfishEnabled;
      this.stockfishEnabled = false; // Temporarily disable to allow the click

      this.handleSquareClick(fromSquare);
      this.handleSquareClick(toSquare);

      // Handle promotion from Stockfish
      if (promotionChar && this.promotionPending) {
        const promoMap: Record<string, string> = { 'q': 'queen', 'r': 'rook', 'b': 'bishop', 'n': 'knight' };
        this.completePromotion(promoMap[promotionChar] || 'queen');
      }

      this.stockfishEnabled = savedEnabled;
    } catch (error) {
      console.error('Stockfish API error:', error);
      this.stockfishThinking = false;
    }
  }
}
