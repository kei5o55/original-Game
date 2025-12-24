// src/logic/board.ts
import type { Cell } from "./types";

export const ROWS = 9;
export const COLS = 9;
export const MINES = 10;

export type ItemType = "heal" | "reveal" | "shield";

export type StepOutcome =
  | { type: "safe"; neighborMines: number }
  | { type: "mine" }
  | { type: "pickup"; item: ItemType };

function createEmptyBoard(rows: number, cols: number): Cell[][] {
  const board: Cell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        hasMine: false,
        isOpen: false,
        isFlagged: false,
        neighborMines: 0,
        // hasPlayer は「使わない」方針なら消してOK
        // hasPlayer: false,
        // item は Cell に追加してる前提（後述）
        item: undefined,
      } as Cell);
    }
    board.push(row);
  }
  return board;
}

function getPlayerStart(rows: number, cols: number) {
  return { x: Math.floor(cols / 2), y: rows - 1 };
}

function placeMines(
  board: Cell[][],
  mines: number,
  forbidden: { x: number; y: number }[] = []
): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  let placed = 0;
  const newBoard = board.map((row) => row.map((c) => ({ ...c })));

  const forbiddenSet = new Set(forbidden.map((p) => `${p.x},${p.y}`));

  while (placed < mines) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);

    if (forbiddenSet.has(`${x},${y}`)) continue;

    if (!newBoard[y][x].hasMine) {
      newBoard[y][x].hasMine = true;
      placed++;
    }
  }

  return newBoard;
}

function countNeighborMines(board: Cell[][], x: number, y: number): number {
  const rows = board.length;
  const cols = board[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      if (board[ny][nx].hasMine) count++;
    }
  }
  return count;
}

function computeNeighborCounts(board: Cell[][]): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = board.map((row) => row.map((c) => ({ ...c })));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!newBoard[y][x].hasMine) {
        newBoard[y][x].neighborMines = countNeighborMines(newBoard, x, y);
      }
    }
  }
  return newBoard;
}

// 盤面を新しく作る（自機スポーン位置は「地雷禁止」だけ適用）
export function createBoard(
  rows: number = ROWS,
  cols: number = COLS,
  mines: number = MINES
): Cell[][] {
  const empty = createEmptyBoard(rows, cols);

  const { x: px, y: py } = getPlayerStart(rows, cols);

  const withMines = placeMines(empty, mines, [{ x: px, y: py }]);
  const withCounts = computeNeighborCounts(withMines);

  return withCounts;
}

// 盤面コピー
export function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map((row) => row.map((c) => ({ ...c })));
}

// 「踏んだ」結果だけ返す（UI文言は入れない）
export function stepOnCell(
  board: Cell[][],
  x: number,
  y: number
): { board: Cell[][]; outcome: StepOutcome } {
  const newBoard = cloneBoard(board);
  const cell = newBoard[y][x];

  // 踏んだマスだけ開く
  cell.isOpen = true;

  // 地雷
  if (cell.hasMine) {
    return { board: newBoard, outcome: { type: "mine" } };
  }

  // アイテム
  if (cell.item) {
    const item = cell.item;
    cell.item = undefined; // 取得したら消す
    return { board: newBoard, outcome: { type: "pickup", item } };
  }

  return {
    board: newBoard,
    outcome: { type: "safe", neighborMines: cell.neighborMines },
  };
}

// クリックされたマスから広がる開放処理（旧マインスイーパー用）
export function openCellsRecursive(board: Cell[][], x: number, y: number): Cell[][] {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard = cloneBoard(board);
  const stack: { x: number; y: number }[] = [{ x, y }];

  while (stack.length > 0) {
    const { x: cx, y: cy } = stack.pop()!;
    const cell = newBoard[cy][cx];

    if (cell.isOpen || cell.isFlagged) continue;
    cell.isOpen = true;

    if (cell.neighborMines === 0 && !cell.hasMine) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
          const neighbor = newBoard[ny][nx];
          if (!neighbor.isOpen && !neighbor.hasMine) {
            stack.push({ x: nx, y: ny });
          }
        }
      }
    }
  }

  return newBoard;
}

// 勝利判定（旧ルール）
export function checkWin(board: Cell[][]): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.hasMine && !cell.isOpen) return false;
    }
  }
  return true;
}
