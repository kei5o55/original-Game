// src/components/Game.tsx
import React, { useState,useEffect} from "react";
import type { Cell, GameStatus, ChapterId } from "../logic/types";import {
  ROWS,
  COLS,
  MINES,
  createBoard,
  cloneBoard,
  openCellsRecursive,
  checkWin,
} from "../logic/board";
import StoryPanel from "./StoryPanel";

const cellSize = 32;

type GameProps = {
    chapter: ChapterId;
    onCleared: (chapter: ChapterId) => void;// 章クリア時のコールバック
    onBackToSelect: () => void;
  };

const Game: React.FC<GameProps> = ({ chapter, onCleared, onBackToSelect }) => {
  const [board, setBoard] = useState<Cell[][]>(() =>
    createBoard(ROWS, COLS, MINES)
  );
  const [status, setStatus] = useState<GameStatus>("playing");
  
  // ★ 通信ログ
  const [storyLog, setStoryLog] = useState<string[]>([// 初期メッセージ
  "『あー、あー……聞こえる？』",
  "『うん！ それじゃあ今日も、よろしくね！』",
]);
  const [hasOpenedAnyCell, setHasOpenedAnyCell] = useState(false);// 最初の1マスを開いたかどうか

  const pushStory = (line: string) => {// 通信ログに追加
    setStoryLog((prev) => [...prev, line]);
  };


  const resetGame = () => {// ゲームリセット処理
    setBoard(createBoard(ROWS, COLS, MINES));// 新しい盤面を作成
    setStatus("playing");// ステータスをリセット
    setHasOpenedAnyCell(false);// 最初の1マスを開いたフラグをリセット
    setStoryLog([]);
    // リセットしたらまた挨拶
    pushStory("『通信再接続っと……よし、改めていこっか！』");
  };

  const handleLeftClick = (cell: Cell) => {
    if (status !== "playing") return;
    if (cell.isOpen || cell.isFlagged) return;

    // 最初の1マスを開いたときのリアクション
    if (!hasOpenedAnyCell && !cell.hasMine) {
      pushStory("『さて……一歩目、踏み出すよ。』");
      setHasOpenedAnyCell(true);
    }

    if (cell.hasMine) {
      const newBoard = cloneBoard(board);
      newBoard.forEach((row) =>
        row.forEach((c) => {
          if (c.hasMine) c.isOpen = true;
        })
      );
      setBoard(newBoard);
      setStatus("lost");
      pushStory("『……っ！ 今の、完全に踏んじゃったね……ごめん。』");
      return;
    }

    const openedBoard = openCellsRecursive(board, cell.x, cell.y);
    setBoard(openedBoard);

    const openedCell = openedBoard[cell.y][cell.x];
    if (openedCell.neighborMines > 0) {
      pushStory(
        `『この辺、反応が強い……周囲に ${openedCell.neighborMines} 箇所、危なそうな場所があるみたい。』`
      );
    } else {
      pushStory("『ここは静か……戦闘の跡もなさそう。』");
    }

    if (checkWin(openedBoard)) {
      setStatus("won");
      pushStory("『やった！ これでこの区画は制圧完了だね！』");
      onCleared(chapter);   // ← ここで App に「クリアしたよ」と教える
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

    if (target.isFlagged) {
      pushStory("『ここは危なそうだから、近づかないようにマークしとくね。』");
    } else {
      pushStory("『あ、ごめん。このマークはいったん外しとく。』");
    }
  };

  // 章が変わるたびにゲーム初期化 今は非表示にしておく
/*useEffect(() => {
  setBoard(createBoard(ROWS, COLS, MINES));
  setStatus("playing");
  setHasOpenedAnyCell(false);
  setStoryLog([
    "『あー、あー……聞こえる？』",
    "『うん！ それじゃあ今日も、よろしくね！』",
  ]);
}, [chapter]);*/


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

      {/* 盤面 + ストーリーパネルを横並びに */}
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
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

        <StoryPanel log={storyLog} />
      </div>

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.8 }}>
        左クリック：開く / 右クリック：フラグ 🚩
      </p>

      <button
        onClick={onBackToSelect}
        style={{
          marginTop: 8,
          padding: "6px 12px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          opacity: status === "playing" ? 0.6 : 1,
        }}
        disabled={status === "playing"} // プレイ中は押せないようにする（好みで）
      >
        セクター選択に戻る
      </button>
    </div>
  );
};

export default Game;
