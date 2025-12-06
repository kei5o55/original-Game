// src/components/Game.tsx
import React, { useState } from "react";
import type { Cell, GameStatus } from "../logic/types";
import {
  ROWS,
  COLS,
  MINES,
  createBoard,
  cloneBoard,
  openCellsRecursive,
  checkWin,
} from "../logic/board";

const cellSize = 32;

const Game: React.FC = () => {
  const [board, setBoard] = useState<Cell[][]>(() =>
    createBoard(ROWS, COLS, MINES)
  );
  const [status, setStatus] = useState<GameStatus>("playing");

  const resetGame = () => {
    setBoard(createBoard(ROWS, COLS, MINES));
    setStatus("playing");
  };

  const handleLeftClick = (cell: Cell) => {
    if (status !== "playing") return;
    if (cell.isOpen || cell.isFlagged) return;

    if (cell.hasMine) {
      const newBoard = cloneBoard(board);
      newBoard.forEach((row) =>
        row.forEach((c) => {
          if (c.hasMine) c.isOpen = true;
        })
      );
      setBoard(newBoard);
      setStatus("lost");
      return;
    }

    const openedBoard = openCellsRecursive(board, cell.x, cell.y);
    setBoard(openedBoard);

    if (checkWin(openedBoard)) {
      setStatus("won");
    }
  };

  const handleRightClick = (e: React.MouseEvent, cell: Cell) => {
    e.preventDefault();
    if (status !== "playing") return;
    if (cell.isOpen) return;

    const newBoard = cloneBoard(board);
    const target = newBoard[cell.y][cell.x];
    target.isFlagged = !target.isFlagged;
    setBoard(newBoard);
  };

  const renderCellContent = (cell: Cell) => {
    if (!cell.isOpen) {
      if (cell.isFlagged) return "🚩";
      return "";
    }
    if (cell.hasMine) return "💣";
    if (cell.neighborMines === 0) return "";
    return cell.neighborMines;
  };

  const statusText =
    status === "playing"
      ? "探索中..."
      : status === "won"
      ? "制圧完了！🎉"
      : "爆発……撤退します💥";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: "24px",
        fontFamily: "sans-serif",
        background: "#0b1020",
        color: "#f5f5f5",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>MISORIA : Frontier（仮）</h1>
      <p style={{ marginBottom: 4, fontSize: 14 }}>簡易マインスイーパー版</p>

      <div style={{ marginBottom: 8 }}>状態：{statusText}</div>
      <button
        onClick={resetGame}
        style={{
          marginBottom: 16,
          padding: "6px 12px",
          borderRadius: 4,
          border: "none",
          cursor: "pointer",
        }}
      >
        リセット
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${cellSize}px)`,
          gap: 2,
          padding: 4,
          background: "#111827",
          borderRadius: 6,
        }}
      >
        {board.map((row) =>
          row.map((cell) => (
            <button
              key={`${cell.x}-${cell.y}`}
              onClick={() => handleLeftClick(cell)}
              onContextMenu={(e) => handleRightClick(e, cell)}
              style={{
                width: cellSize,
                height: cellSize,
                borderRadius: 4,
                border: "1px solid #374151",
                background: cell.isOpen ? "#1f2937" : "#111827",
                color: cell.hasMine
                  ? "#f97373"
                  : cell.neighborMines === 1
                  ? "#60a5fa"
                  : cell.neighborMines === 2
                  ? "#4ade80"
                  : cell.neighborMines >= 3
                  ? "#facc15"
                  : "#e5e7eb",
                fontSize: 18,
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
              }}
            >
              {renderCellContent(cell)}
            </button>
          ))
        )}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.8 }}>
        左クリック：開く / 右クリック：フラグ 🚩
      </p>
    </div>
  );
};

export default Game;
