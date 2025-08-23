export class Move {
  from: [number, number];
  to: [number, number];

  constructor(from: [number, number], to: [number, number]) {
    this.from = from;
    this.to = to;
  }

  getAbstractMoves(position: [number, number]): [number, number][] {
    return [];
  }
}
