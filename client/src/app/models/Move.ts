export type MoveType = 'move' | 'capture' | 'castling' | 'en-passant' | 'promotion';

export interface Move {
  from: [number, number];
  to: [number, number];
  color: 'white' | 'black';
  pieceName: string;
  moveType: MoveType;
  capturedPieceName?: string | null;
  promotionTo?: string | null;
  colorMoveNumber?: number;
}
