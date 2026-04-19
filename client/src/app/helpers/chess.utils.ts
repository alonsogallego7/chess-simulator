export function algebraicToIndex(pos: string): [number, number] {
  const col = pos.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = parseInt(pos[1], 10) - 1;
  return [row, col];
}

export function indexToAlgebraic([row, col]: [number, number]): string {
  return String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
}