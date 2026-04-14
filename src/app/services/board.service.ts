import { Injectable, signal, WritableSignal } from '@angular/core';
import { Piece } from '../models/Piece';
import { Square } from '../models/Square';
import { PieceFactory } from '../models/PieceFactory';
import { Move } from '../models/Move';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  board: WritableSignal<Square[][]> = signal([]);
  gameService: GameService;
  lastMove: Move | null = null;

  setBoard() {
    let newBoard: Square[][] = [];

    let initialPieces: string[] = ["rook","knight","bishop","queen","king","bishop","knight","rook"];

    let auxIndex = 1;
    for (let row = 0; row < 8; row++) {
      let rowArray: Square[] = [];

      for (let col = 0; col < 8; col++) {
        auxIndex += 1;

        let color = auxIndex % 2 === 0 ? "square-beige" : "square-brown";
        let coordinate: [number, number] = [row, col];

        let piece: Piece | null = null;

        if (row === 0) piece = PieceFactory.createPiece("black", initialPieces[col]);
        if (row === 1) piece = PieceFactory.createPiece("black", "pawn");

        if (row === 6) piece = PieceFactory.createPiece("white", "pawn");
        if (row === 7) piece = PieceFactory.createPiece("white", initialPieces[col]);

        rowArray.push(new Square(color, coordinate, piece));
      }

      auxIndex += 1;

      newBoard.push(rowArray);
    }

    this.board.set(newBoard);
  }

  getValidMovesByPiece(piece: Piece | null, ignoreCastling: boolean = false): [number, number][] {
    if (!piece) return [];

    let square = this.getSquareByPiece(piece);
    if (!square) return [];

    let [startRow, startCol] = square.coordinates;
    let abstractMoves = piece.getAbstractMoves();

    let validMoves: [number, number][] = [];

    // Normal moves
    for (let move of abstractMoves) {
      let row = startRow;
      let col = startCol;
      let pawnMoves = 0; 

      do {
        row += move.rowOffset;
        col += move.colOffset;

        if (row < 0 || row > 7 || col < 0 || col > 7) break;

        let targetSquare = this.board()[row][col];

        if (piece.name === "pawn") {
          if (move.colOffset === 0) {
            if ((piece.colour == "white" && row > 3) || (piece.colour == "black" && row < 5)) {
              if (targetSquare.piece) break;
              validMoves.push([row, col]);
            } else if (pawnMoves < 1) {
              if (targetSquare.piece) break;
              validMoves.push([row, col]);
              pawnMoves++;
            }
          } else {
            if (targetSquare.piece && targetSquare.piece.colour !== piece.colour) {
              validMoves.push([row, col]);
            } else if (!targetSquare.piece && this.lastMove) {
              // En Passant check
              let [lfR, lfC] = this.lastMove.from;
              let [ltR, ltC] = this.lastMove.to;
              let lastMovedPiece = this.board()[ltR][ltC].piece;
              
              if (lastMovedPiece?.name === 'pawn' && lastMovedPiece.colour !== piece.colour && Math.abs(lfR - ltR) === 2) {
                if (ltR === startRow && ltC === col) {
                   validMoves.push([row, col]);
                }
              }
            }
            break;
          }
        } else {
          if (targetSquare.piece && targetSquare.piece.colour == piece.colour) break;
          validMoves.push([row, col]);
          if (targetSquare.piece && targetSquare.piece.colour !== piece.colour) break;
        }

      } while (move.repeatable);
    }

    // Filter out moves that would put the king in check
    if (piece.name === "king" && !ignoreCastling) {
      const enemyColour = piece.colour === "white" ? "black" : "white";
      validMoves = validMoves.filter(move => !this.isSquareUnderAttack(move, enemyColour));
    }

    // Castling moves
    if (piece.name === "king" && !piece.hasMoved && !ignoreCastling) {
      const enemyColour = piece.colour === "white" ? "black" : "white";
      
      // Check if King is in check (cannot castle out of check)
      if (!this.isSquareUnderAttack([startRow, startCol], enemyColour)) {
        // King-side
        this.addCastlingMove(piece, startRow, 7, [startRow, 5], [startRow, 6], validMoves);
        // Queen-side
        this.addCastlingMove(piece, startRow, 0, [startRow, 3], [startRow, 2], validMoves, [startRow, 1]);
      }
    }

    return validMoves;
  }

  private addCastlingMove(
    king: Piece, 
    row: number, 
    rookCol: number, 
    passSquare: [number, number], 
    destSquare: [number, number], 
    validMoves: [number, number][],
    additionalEmptySquare?: [number, number]
  ) {
    const rookSquare = this.board()[row][rookCol];
    const enemyColour = king.colour === "white" ? "black" : "white";

    if (rookSquare.piece?.name === "rook" && !rookSquare.piece.hasMoved) {
      const squaresToCheckEmpty = [passSquare, destSquare];
      if (additionalEmptySquare) squaresToCheckEmpty.push(additionalEmptySquare);

      const allEmpty = squaresToCheckEmpty.every(([r, c]) => !this.board()[r][c].piece);
      if (allEmpty) {
        const pathSafe = !this.isSquareUnderAttack(passSquare, enemyColour) && 
                         !this.isSquareUnderAttack(destSquare, enemyColour);
        if (pathSafe) {
          validMoves.push(destSquare);
        }
      }
    }
  }

  getValidMovesToDefendCheckByPiece(checkAttackLine: [number, number][], piece: Piece | null) {
    if (!piece) return [];

    let square = this.getSquareByPiece(piece);
    if (!square) return [];

    let pieceValidMoves = this.getValidMovesByPiece(piece);
    let validMovesToDefendCheck: [number, number][] = [];
    for (let move of pieceValidMoves) {
      if (piece.name === "king") {
          if (!checkAttackLine.some(
            ([r, c]) => r === move[0] && c === move[1])
          ) {
              validMovesToDefendCheck.push([move[0], move[1]]);
          }
      } else {
          if (checkAttackLine.some(
            ([r, c]) => r === move[0] && c === move[1])
          ) {
              validMovesToDefendCheck.push([move[0], move[1]]);
          }
      }
    }


    return validMovesToDefendCheck;
  }

  getSquaresBetweenPieces(startSquare: Square | null, endSquare: Square | null): [number, number][] {
    if (!startSquare?.piece || !endSquare?.piece) return [];

    let [r1, c1] = startSquare.coordinates;
    let [r2, c2] = endSquare.coordinates;

    let dr = Math.sign(r2 - r1);
    let dc = Math.sign(c2 - c1);

    // Solo funciona si están en línea recta o diagonal
    if (!(dr === 0 || dc === 0 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) {
      return [];
    }

    let squares: [number, number][] = [];
    let r = r1 + dr;
    let c = c1 + dc;

    while (r !== r2 || c !== c2) {
      squares.push([r, c]);
      r += dr;
      c += dc;
    }

    return squares;
  }

  movePiece(move: Move) {
    let [rowFrom, colFrom] = move.from;
    let [rowTo, colTo] = move.to;

    let piece = this.board()[rowFrom][colFrom].piece;
    let squareFrom = this.board()[rowFrom][colFrom];
    let squareTo = this.board()[rowTo][colTo];

    squareFrom.piece = null;
    squareTo.piece = piece;
    if (piece) piece.hasMoved = true;

    this.resetSquaresHighlight();

    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        let square = this.board()[row][col];
        if (square.highlight === "last-move-from" || square.highlight === "last-move-to") {
          square.highlight = "none";
        }
      }
    }

    squareFrom.highlight = "last-move-from";
    squareTo.highlight = "last-move-to";
  }

  castle(kingDest: [number, number], color: "white" | "black") {
    const row = color === "white" ? 7 : 0;
    const isKingSide = kingDest[1] === 6;
    
    const kingSquare = this.getKingSquare(color)!;
    const rookCol = isKingSide ? 7 : 0;
    const rookDestCol = isKingSide ? 5 : 3;
    
    const kingDestSquare = this.board()[row][kingDest[1]];
    const rookSquare = this.board()[row][rookCol];
    const rookDestSquare = this.board()[row][rookDestCol];

    const kingPiece = kingSquare.piece;
    const rookPiece = rookSquare.piece;

    // Move King
    kingSquare.piece = null;
    kingDestSquare.piece = kingPiece;
    if (kingPiece) kingPiece.hasMoved = true;

    // Move Rook
    rookSquare.piece = null;
    rookDestSquare.piece = rookPiece;
    if (rookPiece) rookPiece.hasMoved = true;

    this.resetSquaresHighlight();

    // Highlight the move
    kingSquare.highlight = "last-move-from";
    kingDestSquare.highlight = "last-move-to";
  }

  isSquareUnderAttack(coordinate: [number, number], enemyColour: "white" | "black"): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        let square = this.board()[row][col];
        if (square.piece && square.piece.colour === enemyColour) {
          if (square.piece.name === "pawn") {
            let direction = enemyColour === "white" ? -1 : 1;
            let captureCols = [col - 1, col + 1];
            if (row + direction === coordinate[0] && captureCols.includes(coordinate[1])) {
              return true;
            }
          } else {
            // Use ignoreCastling = true to prevent infinite recursion
            let validMoves = this.getValidMovesByPiece(square.piece, true);
            if (validMoves.some(([r, c]) => r === coordinate[0] && c === coordinate[1])) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  getSquareByPiece(piece: Piece): Square | null {
    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        let square = this.board()[row][col];
        if (square.piece === piece) {
          return square;
        }
      }
    }

    return null;
  }

  getKingSquare(colour: "white" | "black"): Square | null {
    for (const row of this.board()) {
      for (const square of row) {
        if (square.piece?.name === "king" && square.piece.colour === colour) {
          return square;
        }
      }
    }
    return null;
  }

  highlightCheck(kingSquare: Square) {
    kingSquare.highlight = "check";
  }

  highlightMoves(selectedSquare: Square, moves: [number, number][]) {
    if (!selectedSquare) return;

    selectedSquare.highlight = "selected";

    for (let [r, c] of moves) {
      let targetSquare = this.board()[r][c];
      targetSquare.highlight = targetSquare.piece ? "intersect" : "move";
    }
  }

  resetSquaresHighlight() {
    for (let row = 0; row < this.board().length; row++) {
      for (let col = 0; col < this.board()[row].length; col++) {
        let square = this.board()[row][col];
        if (
          square.highlight != "last-move-from" &&
          square.highlight != "last-move-to" &&
          square.highlight != "check" &&
          square.highlight != "debug"
        ) {
          square.highlight = "none";
        }
      }
    }
  }

  clearDebugHighlights() {
    for (let row of this.board()) {
      for (let square of row) {
        if (square.highlight === "debug") {
          square.highlight = "none";
        }
      }
    }
  }

  setDebugHighlight(r: number, c: number) {
    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      this.board()[r][c].highlight = "debug";
    }
  }

  promotePawn(square: Square, toPieceType: string = "queen") {
    if (square.piece && square.piece.name === "pawn") {
      square.piece = PieceFactory.createPiece(square.piece.colour, toPieceType);
      square.piece.hasMoved = true;
    }
  }
}

