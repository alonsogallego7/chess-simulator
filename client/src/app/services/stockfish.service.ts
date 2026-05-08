import { Injectable } from '@angular/core';

export interface StockfishResult {
  bestMove: string;   // e.g. "e2e4" or "b7b8q" (with promotion)
  eval: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class StockfishService {
  private worker: Worker | null = null;
  private ready = false;

  /**
   * Initialise the Stockfish WASM Web Worker.
   * Call once; subsequent calls are no-ops.
   */
  init(): void {
    if (this.worker) return;

    // The .js file is served from /assets/stockfish/ thanks to angular.json asset config.
    // stockfish-18-lite-single.js expects the .wasm file next to it with the name "stockfish.wasm".
    // We pass the wasm path via the URL hash so the worker can locate it.
    const jsPath = 'assets/stockfish/stockfish-18-lite-single.js';
    const wasmPath = `${location.origin}/assets/stockfish/stockfish-18-lite-single.wasm`;

    this.worker = new Worker(jsPath + '#' + wasmPath);

    // Wait for the initial "Stockfish …" banner, then send "uci" to initialise.
    this.worker.onmessage = (e: MessageEvent) => {
      const line: string = typeof e.data === 'string' ? e.data : (e.data?.toString() ?? '');
      if (line.startsWith('Stockfish') || line === 'uciok' || line === 'readyok') {
        // Engine is loading – we handle these in getBestMove
      }
    };

    // Send UCI init
    this.worker.postMessage('uci');
  }

  /**
   * Set the engine skill level (0-20).  Lower = weaker.
   */
  setSkillLevel(level: number): void {
    if (!this.worker) this.init();
    this.worker!.postMessage(`setoption name Skill Level value ${level}`);
  }

  /**
   * Get the best move for a given FEN position.
   * Returns a promise that resolves with the best move string (e.g. "e2e4").
   */
  getBestMove(fen: string, depth: number = 12): Promise<StockfishResult> {
    if (!this.worker) this.init();

    return new Promise<StockfishResult>((resolve, reject) => {
      let evalScore: number | null = null;

      const handler = (e: MessageEvent) => {
        const line: string = typeof e.data === 'string' ? e.data : (e.data?.toString() ?? '');

        // Capture eval from info lines: "info depth X ... score cp Y ..."
        if (line.startsWith('info') && line.includes('score cp')) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            evalScore = parseInt(match[1], 10) / 100;
          }
        }

        // Capture mate score
        if (line.startsWith('info') && line.includes('score mate')) {
          const match = line.match(/score mate (-?\d+)/);
          if (match) {
            evalScore = parseInt(match[1], 10) > 0 ? 999 : -999;
          }
        }

        // "bestmove e2e4 ponder e7e5" → extract "e2e4"
        if (line.startsWith('bestmove')) {
          this.worker!.removeEventListener('message', handler);
          const parts = line.split(' ');
          const bestMove = parts[1];
          if (!bestMove || bestMove === '(none)') {
            reject(new Error('No move found'));
          } else {
            resolve({ bestMove, eval: evalScore });
          }
        }
      };

      this.worker!.addEventListener('message', handler);

      // Send position and go
      this.worker!.postMessage(`position fen ${fen}`);
      this.worker!.postMessage(`go depth ${depth}`);
    });
  }

  /**
   * Send a new game command to reset the engine's internal state.
   */
  newGame(): void {
    if (!this.worker) this.init();
    this.worker!.postMessage('ucinewgame');
    this.worker!.postMessage('isready');
  }

  /**
   * Terminate the worker.
   */
  destroy(): void {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }
}
