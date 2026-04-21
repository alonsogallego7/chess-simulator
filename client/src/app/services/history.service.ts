import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Move } from '../models/Move';

export interface GameHistoryPayload {
  moves: Move[];
  winnerColor: string | null;
  isDraw: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  http = inject(HttpClient);
  
  sendGameHistory(payload: GameHistoryPayload) {
    return this.http.post('http://127.0.0.1:5000/api/saveGame', payload);
  }
}
