import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { BoardService } from './board.service';
import { PlayerService } from './player.service';

describe('GameService - 32 Automated Match Tests', () => {
  let gameService: GameService;
  let boardService: BoardService;
  let playerService: PlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    gameService = TestBed.inject(GameService);
    boardService = TestBed.inject(BoardService);
    playerService = TestBed.inject(PlayerService);
    playerService.setPlayers('P1', 'P2');
  });

  const parseCoordinate = (coord: string): [number, number] => {
    const col = coord.charCodeAt(0) - 97;
    const row = 8 - parseInt(coord[1], 10);
    return [row, col];
  };

  const playSequence = (moveSequence: string) => {
    gameService.startGame();
    boardService.setBoard();

    const moves = moveSequence.split(' ').filter(m => m.trim().length >= 4);
    for (const moveStr of moves) {
      if (moveStr === 'break') break; // Allow partial sequences if needed

      const [fr, fc] = parseCoordinate(moveStr.substring(0, 2));
      const [tr, tc] = parseCoordinate(moveStr.substring(2, 4));
      
      const fromSquare = boardService.board()[fr][fc];
      const toSquare = boardService.board()[tr][tc];

      gameService.handleSquareClick(fromSquare);
      gameService.handleSquareClick(toSquare);
    }
  };

  /* ================== ORIGINAL 12 TESTS ================== */
  it('Game 1: Scholar\'s Mate (White Checkmate)', () => {
    playSequence('e2e4 e7e5 f1c4 b8c6 d1h5 g8f6 h5f7');
    expect(gameService.isGameOver).toBeTrue();
    expect(gameService.gameOverReason).toContain('Blancas');
  });

  it('Game 2: Fool\'s Mate (Black Checkmate)', () => {
    playSequence('f2f3 e7e5 g2g4 d8h4');
    expect(gameService.isGameOver).toBeTrue();
    expect(gameService.gameOverReason).toContain('Negras'); 
  });

  it('Game 3: Legal\'s Mate (White Checkmate)', () => {
    playSequence('e2e4 e7e5 g1f3 d7d6 f1c4 c8g4 b1c3 h7h6 f3e5 g4d1 c4f7 e8e7 c3d5');
    expect(gameService.isGameOver).toBeTrue();
    expect(gameService.gameOverReason).toContain('Blancas');
  });

  it('Game 4: Smothered Mate Trap (Black Checkmate)', () => {
    playSequence('e2e4 e7e5 g1f3 b8c6 f1c4 c6d4 f3e5 d8g5 e5f7 g5g2 h1f1 g2e4 c4e2 d4f3');
    expect(gameService.isGameOver).toBeTrue();
    expect(gameService.gameOverReason).toContain('Negras');
  });

  it('Game 5: White Kingside Castling successful', () => {
    playSequence('e2e4 e7e5 g1f3 d7d5 f1c4 h7h6 e1g1');
    const board = boardService.board();
    const g1 = parseCoordinate('g1'); const f1 = parseCoordinate('f1');
    expect(board[g1[0]][g1[1]].piece?.name).toBe('king');
    expect(board[f1[0]][f1[1]].piece?.name).toBe('rook');
  });

  it('Game 6: White Queenside Castling successful', () => {
    playSequence('d2d4 d7d5 b1c3 e7e5 c1f4 f7f5 d1d2 g7g5 e1c1');
    const board = boardService.board();
    const c1 = parseCoordinate('c1'); const d1 = parseCoordinate('d1');
    expect(board[c1[0]][c1[1]].piece?.name).toBe('king');
    expect(board[d1[0]][d1[1]].piece?.name).toBe('rook');
  });

  it('Game 7: Black Kingside Castling successful', () => {
    playSequence('e2e4 e7e5 g1f3 g8f6 f1c4 f8c5 h2h3 e8g8');
    const board = boardService.board();
    const g8 = parseCoordinate('g8'); const f8 = parseCoordinate('f8');
    expect(board[g8[0]][g8[1]].piece?.name).toBe('king');
    expect(board[f8[0]][f8[1]].piece?.name).toBe('rook');
  });

  it('Game 8: Black Queenside Castling successful', () => {
    playSequence('d2d4 d7d5 b1c3 b8c6 c1e3 c8e6 d1d2 d8d7 g2g3 e8c8');
    const board = boardService.board();
    const c8 = parseCoordinate('c8'); const d8 = parseCoordinate('d8');
    expect(board[c8[0]][c8[1]].piece?.name).toBe('king');
    expect(board[d8[0]][d8[1]].piece?.name).toBe('rook');
  });

  it('Game 9: Should defend Check by capturing attacking piece', () => {
    playSequence('e2e4 d7d5 f1b5 c8d7 b5d7 d8d7');
    expect(gameService.isCheck).toBeFalse();
  });

  it('Game 10: Should defend Check by blocking', () => {
    playSequence('e2e4 d7d5 f1b5 c7c6');
    expect(gameService.isCheck).toBeFalse();
  });

  it('Game 11: Pawn should capture En Passant', () => {
    playSequence('e2e4 a7a6 e4e5 d7d5 e5d6');
    const d6 = parseCoordinate('d6');
    expect(boardService.board()[d6[0]][d6[1]].piece?.name).toBe('pawn');
  });

  it('Game 12: Pawn should auto-promote to Queen', () => {
    playSequence('a2a4 h7h6 a4a5 h6h5 a5a6 h5h4 a6b7 a7a6 b7a8');
    const a8 = parseCoordinate('a8');
    expect(boardService.board()[a8[0]][a8[1]].piece?.name).toBe('queen');
  });

  /* ================== EXTRA 20 TESTS (13 to 32) ================== */
  
  it('Game 13: Kingside castling invalid if king already moved', () => {
    playSequence('e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1f1 f8c5 f1e1 e8g8 e1g1');
    const e1 = parseCoordinate('e1');
    expect(boardService.board()[e1[0]][e1[1]].piece?.name).toBe('king');
  });

  it('Game 14: Kingside castling invalid if rook already moved', () => {
    playSequence('e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 h1g1 f8c5 g1h1 e8g8 e1g1');
    const e1 = parseCoordinate('e1');
    expect(boardService.board()[e1[0]][e1[1]].piece?.name).toBe('king');
  });

  it('Game 15: Invalid castling out of check', () => {
    playSequence('e2e4 e7e5 g1f3 b8c6 f1c4 f8c5 c2c3 c5f2 e1g1'); 
    const e1 = parseCoordinate('e1');
    expect(boardService.board()[e1[0]][e1[1]].piece?.name).toBe('king');
  });

  it('Game 16: Invalid castling when path is blocked', () => {
    playSequence('e2e4 e7e5 e1g1');
    const e1 = parseCoordinate('e1');
    expect(boardService.board()[e1[0]][e1[1]].piece?.name).toBe('king');
  });

  it('Game 17: Pawn cannot move forward if blocked by enemy', () => {
    playSequence('e2e4 e7e5 e4e5'); // e4 to e5 invalid
    const e4 = parseCoordinate('e4');
    expect(boardService.board()[e4[0]][e4[1]].piece?.name).toBe('pawn');
  });

  it('Game 18: Pawn cannot move if blocked by friendly', () => {
    playSequence('g1f3 a7a6 f2f3');
    const f2 = parseCoordinate('f2');
    expect(boardService.board()[f2[0]][f2[1]].piece?.name).toBe('pawn');
  });

  it('Game 19: Knight cannot make invalid un-L-shaped move', () => {
    playSequence('g1g3');
    const g1 = parseCoordinate('g1');
    expect(boardService.board()[g1[0]][g1[1]].piece?.name).toBe('knight');
  });

  it('Game 20: Bishop cannot make straight moves', () => {
    playSequence('e2e4 a7a6 f1f2'); // f1f2 is straight
    const f1 = parseCoordinate('f1');
    expect(boardService.board()[f1[0]][f1[1]].piece?.name).toBe('bishop');
  });

  it('Game 21: Rook cannot make diagonal moves', () => {
    playSequence('h2h4 a7a6 h1g2'); // h1g2 is diagonal
    const h1 = parseCoordinate('h1');
    expect(boardService.board()[h1[0]][h1[1]].piece?.name).toBe('rook');
  });

  it('Game 22: Queen cannot make knight moves', () => {
    playSequence('d1c3');
    const d1 = parseCoordinate('d1');
    expect(boardService.board()[d1[0]][d1[1]].piece?.name).toBe('queen');
  });

  it('Game 23: King cannot move 2 squares natively (unless castling)', () => {
    playSequence('e1e3');
    const e1 = parseCoordinate('e1');
    expect(boardService.board()[e1[0]][e1[1]].piece?.name).toBe('king');
  });

  it('Game 24: Cannot move pinned piece', () => {
    playSequence('e2e4 d7d5 d2d4 d5e4 d1e2 b8c6 c2c4 c6d4');
    // c4 blocks, but let's test a simple vertical pin
    // e2e4 d7d5 e4d5 d8d5 d1e2. Black queen is at d5. White queen at e2. White king at e1.
    // e2e2 doesn't exist.
    // Let's do:
    // e2e4 d7d5 e1e2 c8g4 e2e3
    playSequence('e2e4 d7d5 g1f3 b8c6 f1b5 c6d4'); // f1b5 pins c6 Knight. c6d4 invalid.
    const c6 = parseCoordinate('c6');
    expect(boardService.board()[c6[0]][c6[1]].piece?.name).toBe('knight');
  });

  it('Game 25: Friendly fire is prevented', () => {
    playSequence('g1e2'); // Knight attacks own pawn
    const g1 = parseCoordinate('g1');
    expect(boardService.board()[g1[0]][g1[1]].piece?.name).toBe('knight');
  });

  it('Game 26: Moving empty square does nothing', () => {
    playSequence('e3e4');
    expect(gameService.movesHistory.length).toBe(0);
  });

  it('Game 27: En Passant window expires if not immediately captured', () => {
    playSequence('e2e4 a7a6 e4e5 d7d5 h2h3 h7h6 e5d6'); // d6 delayed
    const d5 = parseCoordinate('d5');
    expect(boardService.board()[d5[0]][d5[1]].piece?.name).toBe('pawn'); // black pawn survives
  });

  it('Game 28: Sam Loyds fast Stalemate', () => {
    playSequence('e2e3 a7a5 d1h5 a8a6 h5a5 h7h5 h2h4 a6h6 a5c7 f7f6 c7d7 e8f7 d7b7 d8d3 b7b8 d3h7 b8c8 f7g6 c8e6');
    expect(gameService.isGameOver).toBeTrue();
    expect(gameService.gameOverReason).toContain('Stalemate');
  });

  it('Game 29: Black pawn auto-promotes to Queen', () => {
    // simplified path:
    playSequence('h2h3 a7a5 h3h4 a5a4 h4h5 a4a3 h5h6 a3b2 h6h7 b2c1'); // b2 captures c1 bishop
    const c1 = parseCoordinate('c1');
    expect(boardService.board()[c1[0]][c1[1]].piece?.name).toBe('queen');
    expect(boardService.board()[c1[0]][c1[1]].piece?.colour).toBe('black');
  });

  it('Game 30: Invalid check bypass (moving other piece when in check)', () => {
    playSequence('e2e4 d7d5 f1b5 a7a6'); // Check on e8! But black tries a7a6
    const a7 = parseCoordinate('a7');
    expect(boardService.board()[a7[0]][a7[1]].piece?.name).toBe('pawn'); // Pawn should not have moved
  });

  it('Game 31: Discovered check triggers check detection properly', () => {
    playSequence('e2e4 e7e5 g1f3 d7d6 d2d4 d8e7 f1b5 e8d8 e1g1 f7f6 d4d5 c7c6 d5c6 b7c6 b5a4 d8e8');
    expect(gameService.isCheck).toBeFalse();
  });

  it('Game 32: White normal diagonal capture validation', () => {
    playSequence('e2e4 d7d5 e4d5');
    const d5 = parseCoordinate('d5');
    expect(boardService.board()[d5[0]][d5[1]].piece?.name).toBe('pawn');
    expect(boardService.board()[d5[0]][d5[1]].piece?.colour).toBe('white');
  });
});
