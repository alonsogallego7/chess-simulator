import { Injectable } from '@angular/core';

export interface StockfishResponse {
  text: string;
  eval: number;
  move: string;       // e.g. "e7e5" or "b7b8q" (with promotion)
  fen: string;
  depth: number;
  winChance: number;
  continuationArr: string[];
  mate: number | null;
  centipawns: string;
  san: string;
  lan: string;
  turn: string;
  color: string;
  piece: string;
  flags: string;
  isCapture: boolean;
  isCastling: boolean;
  isPromotion: boolean;
  from: string;       // e.g. "e7"
  to: string;         // e.g. "e5"
  fromNumeric: string;
  toNumeric: string;
  taskId: string;
  time: number;
  type: 'move' | 'bestmove' | 'info';
  promotion?: string;
  captured?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StockfishService {
  private readonly API_URL = 'https://chess-api.com/v1';

  async getBestMove(fen: string, depth: number = 12): Promise<StockfishResponse> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fen,
        depth,
        maxThinkingTime: 50
      })
    });

    return response.json();
  }
}
