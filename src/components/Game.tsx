// src/components/Game.tsx
import React, { useState,useEffect} from "react";
import "./Game.css"
import type { Cell, GameStatus, ChapterId, StoryLogItem } from "../logic/types";
import {stepOnCell} from "../logic/board";
import StoryPanel from "./StoryPanel";
import { scriptForOutcome } from "../story/scripts";
import { CHAPTER_CONFIG } from "../logic/chapters";

import {
  createBoard,
  cloneBoard,
  openCellsRecursive,
  checkWin,
} from "../logic/board";

const cellSize = 32;

type GameProps = {
    chapter: ChapterId;
    onCleared: (chapter: ChapterId) => void;// 章クリア時のコールバック
    onBackToSelect: () => void;
};

const characterImageByStatus: Record<GameStatus, string> = {
  playing: "/images/a.png",
  won: "/images/a.png",
  lost: "/images/a.png",
};

const Game: React.FC<GameProps> = ({ chapter, onCleared, onBackToSelect }) => {

  const config = CHAPTER_CONFIG[chapter];
  const START_POS = {
    x: Math.floor(config.cols / 2),
    y: config.rows - 1,
  };
  const [board, setBoard] = useState<Cell[][]>(() =>
    createBoard(config.rows, config.cols, config.mines)
  );
  const [status, setStatus] = useState<GameStatus>("playing");

  const currentCharaImage = characterImageByStatus[status];

  const [playerPos, setPlayerPos] = useState(START_POS);

  const gap = 2;
  const offset = cellSize + gap;
  const playerX = playerPos.x * offset;
  const playerY = playerPos.y * offset;

    
  // ★ 通信ログ
  const [storyLog, setStoryLog] = useState<StoryLogItem[]>([
    { type: "text", message: "『あー、あー……聞こえる？』" },
    { type: "text", message: "『うん！ それじゃあ今日も、よろしくね！』" },
  ]);

  const pushText = (message: string) => {
    setStoryLog((prev) => [...prev, { type: "text", message }]);
  };

  const pushLogs = (items: StoryLogItem[]) => {
    setStoryLog(prev => [...prev, ...items]);
  };

  const onStep = (x: number, y: number) => {
    const { board: nextBoard, outcome } = stepOnCell(board, x, y);
    setBoard(nextBoard);

    if(outcome.type==="mine") setStatus("lost");

    pushLogs(scriptForOutcome(outcome,{chapter}));
    
  };

  useEffect(() => {
    // chapter切替時に盤面を作り直し＆初期マスを踏む
    const fresh = createBoard(config.rows, config.cols, config.mines);
    setBoard(fresh);
    setStatus("playing");
    setPlayerPos(START_POS);

    // 初期マスを踏む（freshを使うのが安全）
    const { board: opened, outcome } = stepOnCell(fresh, START_POS.x, START_POS.y);
    setBoard(opened);
    pushLogs(scriptForOutcome(outcome, { chapter }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  useEffect(() => {
    const moveTo = (nx: number, ny: number) => {
      setPlayerPos({ x: nx, y: ny });
      onStep(nx, ny); // ★踏んだ判定を発動
    };


    const onKeyDown = (e: KeyboardEvent) => {
      if (status !== "playing") return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveTo(playerPos.x, Math.max(0, playerPos.y - 1));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        moveTo(playerPos.x, Math.min(config.rows - 1, playerPos.y + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveTo(Math.max(0, playerPos.x - 1), playerPos.y);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        moveTo(Math.min(config.cols - 1, playerPos.x + 1), playerPos.y);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerPos, status, board]); 


    const [hasOpenedAnyCell, setHasOpenedAnyCell] = useState(false);// 最初の1マスを開いたかどうか


    const resetGame = () => {
      const freshBoard = createBoard(config.rows, config.cols, config.mines);

      setBoard(freshBoard);
      setPlayerPos({
        x: Math.floor(config.cols / 2),
        y: config.rows - 1,
      });
      //setHp(config.maxHp);//いったんコメントアウト
      //setCollectedEvents(new Set());//いったんコメントアウト
      setStatus("playing");
      setHasOpenedAnyCell(false);
      setPlayerPos(START_POS);

      // ログ初期化
      setStoryLog([
        { type: "text", message: "『通信再接続っと……よし、改めていこっか！』" },
      ]);

      // ★初期マスを自動で開く（freshBoardを使う！）
      const { board: opened, outcome } = stepOnCell(freshBoard, START_POS.x, START_POS.y);
      setBoard(opened);

      // 初期マスのログ（好みで）
      if (outcome.type === "safe") {
        if (outcome.neighborMines > 0) {
          pushText(`『反応あり……この周囲に ${outcome.neighborMines} 箇所、危ない場所がある。』`);
        } else {
          pushText("『ここは静か……問題なさそう。』");
        }
      }
    };

    const handleLeftClick = (cell: Cell) => {//勝利判定のやつ（一応残しておく
      if (status !== "playing") return;
      if (cell.isOpen || cell.isFlagged) return;

      // 最初の1マスを開いたときのリアクション
      if (!hasOpenedAnyCell && !cell.hasMine) {
        pushText("『さて……一歩目、踏み出すよ。』");
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
        pushText("『……っ！ 今の、完全に踏んじゃったね……ごめん。』");
        return;
      }

      const openedBoard = openCellsRecursive(board, cell.x, cell.y);
      setBoard(openedBoard);

      if (checkWin(openedBoard)) {
        setStatus("won");
        pushText("『やった！ これでこの区画は制圧完了だね！』");
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
        pushText("『ここは危なそうだから、近づかないようにマークしとくね。』");
      } else {
        pushText("『あ、ごめん。このマークはいったん外しとく。』");
      }
    };

    const renderCellContent = (cell: Cell) => {
      if (!cell.isOpen) {
        if (cell.isFlagged) return "🚩";
        return "";
      }
      if (cell.hasMine) return "💣";
      if (cell.isGoal) return "🚪";
      if (cell.eventId) return "📡";   // まだ回収前なら表示
      if (cell.item) return "🎁";
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

          {/* ▼ 盤面 + 自機レイヤー */}
  <div
    style={{
      position: "relative",
      flexShrink: 0,
    }}
  >
    {/* ▼ 盤面グリッド */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
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
              appearance: "none",
              padding: 0,
              lineHeight: 1,
              boxSizing: "border-box",
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

    {/* ▼ ★自機レイヤー（ここ！） */}
    <div
    style={{
      position: "absolute",
      top: 4,
      left: 4,
      pointerEvents: "none",
      transform: `translate(${playerX}px, ${playerY}px)`,
      transition: "transform 0.18s ease-out",
    }}
  >
    <div className="player-face">🙂</div>
  </div>
  </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 12px",
              background: "rgba(15,23,42,0.85)",
              borderRadius: 8,
              boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              maxWidth: 220,
            }}
          >
            <img
              src={currentCharaImage}
              alt="主人公"
              className="player-float"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
                objectFit: "cover",
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: 12, opacity: 0.85, textAlign: "center" }}>
              {/* ひとことセリフとかプロフィール */}
              {status === "playing" && "『よし、このセクターも調査していこっか。』"}
              {status === "won" && "『制圧完了！ データの解析、楽しみだな〜』"}
              {status === "lost" && "『うわっ…！ ご、ごめん、ちょっと慎重さ足りなかったかも…』"}
            </div>
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
