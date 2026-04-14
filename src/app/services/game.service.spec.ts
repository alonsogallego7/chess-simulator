import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { BoardService } from './board.service';
import { PlayerService } from './player.service';

describe('GameService - 10 Automated Match Tests', () => {
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

    const moves = moveSequence.split(' ').filter(m => m.trim().length === 4);
    for (const moveStr of moves) {
      const [fr, fc] = parseCoordinate(moveStr.substring(0, 2));
      const [tr, tc] = parseCoordinate(moveStr.substring(2, 4));
      
      const fromSquare = boardService.board()[fr][fc];
      const toSquare = boardService.board()[tr][tc];

      gameService.handleSquareClick(fromSquare);
      gameService.handleSquareClick(toSquare);
    }
  };

  it('Game 1: Scholar\'s Mate (White Checkmate)', () => {
    playSequence('e2e4 e7e5 f1c4 b8c6 d1h5 g8f6 h5f7');
    expect(gameService.isGameOver).toBeTrue();
    expect(gameService.gameOverReason).toContain('Blancas'); // Checkmate Blancas
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
    playSequence('e2e4 e7e5 g1f3 d7d5 f1c4 f5f4 e1g1');
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
    const d7 = parseCoordinate('d7');
    expect(boardService.board()[d7[0]][d7[1]].piece?.name).toBe('queen');
  });

  it('Game 10: Should defend Check by blocking', () => {
    playSequence('e2e4 d7d5 f1b5 c7c6');
    expect(gameService.isCheck).toBeFalse();
    const c6 = parseCoordinate('c6');
    expect(boardService.board()[c6[0]][c6[1]].piece?.name).toBe('pawn');
  });

  it('Game 11: Pawn should capture En Passant', () => {
    playSequence('e2e4 a7a6 e4e5 d7d5 e5d6');
    // White pawn should be at d6
    const d6 = parseCoordinate('d6');
    expect(boardService.board()[d6[0]][d6[1]].piece?.name).toBe('pawn');
    expect(boardService.board()[d6[0]][d6[1]].piece?.colour).toBe('white');
    // Black pawn at d5 should be null
    const d5 = parseCoordinate('d5');
    expect(boardService.board()[d5[0]][d5[1]].piece).toBeNull();
  });

  it('Game 12: Pawn should auto-promote to Queen', () => {
    // white pawn pushes to a8
    playSequence('a2a4 h7h6 a4a5 h6h5 a5a6 h5h4 a6b7 a7a6 b7a8');
    // a8 should have white queen
    const a8 = parseCoordinate('a8');
    expect(boardService.board()[a8[0]][a8[1]].piece?.name).toBe('queen');
    expect(boardService.board()[a8[0]][a8[1]].piece?.colour).toBe('white');
  });
});
