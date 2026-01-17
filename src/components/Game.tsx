// src/components/Game.tsx
import React, { useEffect, useRef, useState } from "react";
import "./Game.css"
import type { Cell, GameStatus, ChapterId, StoryLogItem } from "../logic/types";
import {stepOnCell} from "../logic/board";
import { stepEnemy, isHitAfterMove } from "../logic/enemy";
import StoryPanel from "./StoryPanel";
import { scriptForOutcome } from "../story/scripts";
import { CHAPTER_CONFIG } from "../logic/chapters";
import { getItemDef } from "../logic/items";
import type { ItemLogEntry } from "../logic/types";  // 置き場所は好きで
import LogGalleryModal from "./LogGalleryModal";
import type { ItemId } from "../logic/items";
import {
  createBoard,
  cloneBoard,
  checkWin,
} from "../logic/board";
import type { EnemyState } from "../logic/types";
import { ENEMY_SPAWNS_BY_CHAPTER } from "../logic/enemySpawns";
import { getEnemyDef } from "../logic/enemyDefs";


const cellSize = 32;

type GameProps = {
    chapter: ChapterId;
    onCleared: (chapter: ChapterId) => void;// 章クリア時のコールバック
    onBackToSelect: () => void;
};

const characterImageByStatus: Record<GameStatus, string> = {
  playing: "/images/a.png",
  won: "/images/b.png",
  lost: "/images/a.png",
};
const LS_KEYS = {
  collection: "misoria.collection.v1",
  itemLogs: "misoria.itemLogs.v1",
};

// ローカルストレージから Set<string> を読み書きする（いったんエラーでいい）
const loadSet = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set<string>();
    return new Set<string>(JSON.parse(raw));
  } catch {
    return new Set<string>();
  }
};

const saveSet = (key: string, s: Set<string>) => {
  localStorage.setItem(key, JSON.stringify(Array.from(s)));
};

const loadLogs = (): ItemLogEntry[] => {
  try {
    const raw = localStorage.getItem(LS_KEYS.itemLogs);
    return raw ? (JSON.parse(raw) as ItemLogEntry[]) : [];
  } catch {
    return [];
  }
};
//↑ここまで

const Game: React.FC<GameProps> = ({ chapter, onCleared, onBackToSelect }) => {
  //const [collectedCount, setCollectedCount] = useState(0);
  const stepAudioRef = useRef<HTMLAudioElement | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [canProceed,setCanProceed]=useState(false);
  const [collectedItems, setCollectedItems] = useState(0);
  const config = CHAPTER_CONFIG[chapter];
  //const [collection, setCollection] = useState<Set<string>>(() => loadSet(LS_KEYS.collection));
  //const [itemLogs, setItemLogs] = useState<ItemLogEntry[]>(() => loadLogs());//ログをロード（jsonになるのでいったんオフ）
  const [itemLogs, setItemLogs] = useState<ItemLogEntry[]>([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [enemies, setEnemies] = useState<EnemyState[]>([]);
  const [collection, setCollection] = useState<Set<ItemId>>(() => {
    // localStorageから読むならここ（いったん空でもOK）
    return new Set<ItemId>();
  });
  const [skipMoveAnim, setSkipMoveAnim] = useState(false);
  const spawns = ENEMY_SPAWNS_BY_CHAPTER[chapter];
  const enemyCount = spawns.length;

  //hp管理系
  const [hp, setHp] = useState(config.maxHp);
  const maxDecoy = config.maxHp;
  const [decoyFlash, setDecoyFlash] = useState(false);



  useEffect(() => {
    const spawns = ENEMY_SPAWNS_BY_CHAPTER[chapter];
    const initEnemies: EnemyState[] = spawns.map(s => {
      const def = getEnemyDef(s.enemyId);
      return {
        uid: s.uid,
        enemyId: s.enemyId,
        route: s.route,
        idx: 0,          // route[0] が初期位置
        hp: def.maxHp,
      };
    });
    setEnemies(initEnemies);
  }, [chapter]);


  const START_POS = {
    x: Math.floor(config.cols / 2),
    y: config.rows - 1,
  };
  const toPx = (x: number) => (x - 1) * offset;
  const toPy = (y: number) => (y - 1) * offset;


  const advanceTurn = (nx: number, ny: number) => {
    console.count("advanceTurn");

    if (nx === playerPos.x && ny === playerPos.y) return;
    if (status !== "playing") return;

    const prevPlayer = playerPos;
    const nextPlayer = { x: nx, y: ny };

    const prevEnemies = enemies;//このターン開始時の敵
    const nextEnemies = enemies.map(stepEnemy);//移動後の敵

    const hit = isHitAfterMove(prevPlayer, nextPlayer, prevEnemies, nextEnemies);//衝突した敵があれば衝突の種類（すれ違いor重なり）とその時点の enemies 配列におけるインデックスを持つ
    const enemyName =hit.kind === "none" ? "" : getEnemyDef(prevEnemies[hit.enemyIndex].enemyId).name;//衝突の種類がnone(衝突していない)以外の時，衝突時に該当する敵（prevEnemies[enemyIndex]）の名前を取得する
    const damage =hit.kind === "none" ? 0 : getEnemyDef(prevEnemies[hit.enemyIndex].enemyId).atk;

    setEnemies(nextEnemies);

    if (hit.kind !== "none") {
      setSkipMoveAnim(hit.kind === "crossed");

      if (hp >= damage) {
        // ★ デコイが足りる → 消費して生存
        const nextHp = hp - damage;
        setHp(nextHp);

        setDecoyFlash(true);
        setTimeout(() => setDecoyFlash(false), 180);

        pushText(`『${enemyName}に捕まった……！デコイを使用！』`);
      } else {
        // ★ デコイ不足 → ゲームオーバー
        if(hit.kind !== "crossed")setPlayerPos({ x: nx, y: ny });
        setHp(0); // 任意：UI上ゼロにする
        setStatus("lost");
        pushText(`『デコイが足りない……！ ${enemyName}にやられた……！』`);
      }

      // crossed のときは位置は動かさない
      if (hit.kind !== "crossed") {
        playStepSound();
        setPlayerPos({ x: nx, y: ny });
      }

      return;
    }
    // 何も当たってない通常移動
    setSkipMoveAnim(false);
    playStepSound();
    setPlayerPos({ x: nx, y: ny });
    onStep(nx, ny);
  };
  

  useEffect(() => {//効果音
    stepAudioRef.current = new Audio("/sfx/step.mp3");// 音声ファイルのパス
    stepAudioRef.current.volume = 0.35; // 好みで
  }, []);

  const countItemsOnBoard = (b: Cell[][]) => {
    let n = 0;
    for (const row of b) {
      for (const cell of row) {
        if (cell.itemId) n++;
      }
    }
    return n;
  };

  useEffect(() => {
    setTotalItems(countItemsOnBoard(board));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回だけ

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

  const playStepSound = () => {// 音再生
    const a = stepAudioRef.current;
    if (!a) return;

    // 連打でも鳴るように巻き戻す
    a.currentTime = 0;
    a.play().catch(() => {
      // ブラウザの自動再生制限で失敗することがある（最初のクリック後は通りやすい）
    });
  };
  

    
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

    const collectedNow =
      totalItems - countItemsOnBoard(nextBoard); // 残りから逆算
    
    if (outcome.type === "pickup") {
      //const def = getItemDef(outcome.itemId);
      setCollectedItems((c) => c + 1);//アイテム拾った処理（下でもやってるからいらないかも）

      // ② 取得済みコレクション（重複取得を防ぐ）//永続になる
      /*setCollection(prev => {
        const next = new Set(prev);
        next.add(outcome.itemId);
        saveSet(LS_KEYS.collection, next);
        return next;
      });*/
      setCollection(prev => {// ローカルストレージ保存版
        const next = new Set(prev);
        next.add(outcome.itemId);
        // localStorageに保存するならここ
        return next;
      });

      // ③ 鑑賞用ログ（履歴として積む）
      setItemLogs(prev => [...prev, { itemId: outcome.itemId, chapter, obtainedAt: Date.now() }]);//ログを追加

      /*setItemLogs(prev => {// ログを追加（ローカルストレージ保存版）
        const next = [
          ...prev,
          { itemId: outcome.itemId, chapter, obtainedAt: Date.now() },
        ];
        localStorage.setItem(LS_KEYS.itemLogs, JSON.stringify(next));
        return next;
      });*/

    }
    
    if(outcome.type==="mine") setStatus("lost");//地雷踏んだ時
    
    pushLogs(scriptForOutcome(outcome,{chapter}));

    if (checkWin(nextBoard)) {//地雷マス以外開いたとき
      pushText("『やった！ これでこの区画は制圧完了だね！』");
      //onCleared(chapter);   // ← ここで App に「クリアしたよ」と教える
    }
    
    if(collectedNow==totalItems){
      pushText("『必要なデータは全部集まった……！ ゴールに向かおう！』")
    }
    // ゴール踏んだ時の判定
    if (outcome.type === "goal") {
      if (collectedNow >= totalItems) { // ←後述
        setStatus("won");
        setCanProceed(true);//クリア可能
        pushText("『ゴールに到達！』");
        //onCleared(chapter);//すぐに遷移する形なのでコメントアウト
      } else {
        pushText(`『まだ回収が残ってる…残り ${totalItems - collectedNow} 個！』`);
      }
      return;
    }
  };

  useEffect(() => {
    // chapter切替時に盤面を作り直し＆初期マスを踏む
    const fresh = createBoard(config.rows, config.cols, config.mines);
    setBoard(fresh);
    setStatus("playing");
    setCanProceed(false);//リセット（クリア不可）
    setPlayerPos(START_POS);

    // 初期マスを踏む（freshを使うのが安全）
    const { board: opened, outcome } = stepOnCell(fresh, START_POS.x, START_POS.y);
    setBoard(opened);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  useEffect(() => {//キーボード入力
    const onKeyDown = (e: KeyboardEvent) => {
      if (status !== "playing") return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        advanceTurn(playerPos.x, Math.max(0, playerPos.y - 1));
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        advanceTurn(playerPos.x, Math.min(config.rows - 1, playerPos.y + 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        advanceTurn(Math.max(0, playerPos.x - 1), playerPos.y);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        advanceTurn(Math.min(config.cols - 1, playerPos.x + 1), playerPos.y);
      }
      
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playerPos, status, board]); 


    const [hasOpenedAnyCell, setHasOpenedAnyCell] = useState(false);// 最初の1マスを開いたかどうか


  const resetGame = () => {
    const freshBoard = createBoard(config.rows, config.cols, config.mines, {
      excludeItemIds: collection,
    });
    setTotalItems(countItemsOnBoard(freshBoard));
    setCollectedItems(0);
    setBoard(freshBoard);
      setPlayerPos({
      x: Math.floor(config.cols / 2),
      y: config.rows - 1,
    });
    /*敵位置の初期化 */
    const spawns = ENEMY_SPAWNS_BY_CHAPTER[chapter];
    const initEnemies: EnemyState[] = spawns.map(s => {
      const def = getEnemyDef(s.enemyId);
      return {
        uid: s.uid,
        enemyId: s.enemyId,
        route: s.route,
        idx: 0,          // route[0] が初期位置
        hp: def.maxHp,
      };
    });

    setEnemies(initEnemies);
    setHp(config.maxHp);//hpを初期値に（chapterごとに異なる）
    //setCollectedEvents(new Set());//いったんコメントアウト
    setStatus("playing");
    setCanProceed(false);//クリア不可にリセット
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
        pushText(`『敵は ${enemyCount} ！』`);

      }
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

    const renderCellContent = (cell: Cell, isInVision: boolean) => {

      const canShow = cell.isOpen || isInVision;
      if (!canShow) {
        if (cell.isFlagged) return "🚩";
        return "";
      }
      if (cell.hasMine && cell.isOpen) return "💣";
      if (cell.isGoal) return "🚪";
      if (cell.eventId) return "📡";   // まだ回収前なら表示
      //if (cell.item) return "🎁";
      if (cell.itemId) return "🎁";
      if (cell.isGoal) return "🚪";
      if (cell.neighborMines === 0) return "";
      return cell.neighborMines;
    };

    const statusText =
      status === "playing"
        ? "探索中..."
        : status === "won"
        ? "制圧完了！🎉"
        : "爆発……撤退します💥";

    const isNoDecoy = hp === 0;

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
          <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",   // ← これが本命
          }}
        ></div>
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
        row.map((cell) => {
          const isInVision = Math.abs(cell.x - playerPos.x) + Math.abs(cell.y - playerPos.y) <= 1;
          const showGlow = isInVision && (cell.itemId);//上下左右かつアイテムありの場合のみ発光

          return (
          <button
            key={`${cell.x}-${cell.y}`}
            onContextMenu={(e) => handleRightClick(e, cell)}
            style={{
              width: cellSize,
              height: cellSize,
              appearance: "none",
              padding: 0,
              lineHeight: 1,
              boxSizing: "border-box",
              border: "1px solid #374151",
              background: isInVision
                ? cell.isOpen
                  ? "#27324a"
                  : "#1a2140"
                : cell.isOpen
                ? "#1f2937"
                : "#111827",
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
            {/* ★ 発光は div に */}
            <div className={`cell-inner ${showGlow ? "cell-glow" : ""}`}>
              {renderCellContent(cell, isInVision)}
            </div>
          </button>
        );
      })
      )}
    </div>

    {status === "won" && canProceed && (
      <button
        onClick={() => onCleared(chapter)}
        style={{
          marginTop: 12,
          padding: "10px 16px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
        >
        次のセクターへ進む
        </button>
    )}

  {/*自機レイヤ */}
  <div
    style={{
      position: "absolute",
      top: 4,
      left: 4,
      pointerEvents: "none",
      transform: `translate(${playerX}px, ${playerY}px)`,
      transition: skipMoveAnim ? "none" : "transform 0.18s ease-out",
    }}
  >
    <div className="player-face">🙂</div>
  </div>
  {/* ▼ 敵レイヤー */}
  <div style={{ position: "absolute", top: 4, left: 4, pointerEvents: "none" }}>
    {enemies.map((enemy) => {
      const p = enemy.route[enemy.idx];     // idx=0 なので route[0] が初期位置
      const def = getEnemyDef(enemy.enemyId);

      return (
        <div
          key={enemy.uid}
          className="enemy-sprite"
          style={{
            position: "absolute", 
            top: 0,
            left: 0,
            transform: `translate(${p.x * offset}px, ${p.y * offset}px)`,
            transition: "transform 0.18s ease-out",
          }}
          title={`${def.name} HP:${enemy.hp}`}
        >
          {def.sprite}
        </div>
      );
    })}
  </div>
  
  </div>
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
        回収：{collectedItems} / {totalItems}
      </div>
          <div  
            style={{
              display: "flex",
              height: "auto",
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
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 12,
                  background: isNoDecoy
                    ? "rgba(80,20,20,0.55)"
                    : "rgba(15,23,42,0.55)",
                  border: isNoDecoy
                    ? "1px solid rgba(255,120,120,0.6)"
                    : "1px solid rgba(255,255,255,0.15)",
                  color: isNoDecoy ? "#ffdada" : "#f5f5f5",

                  boxShadow: decoyFlash
                    ? "0 0 12px rgba(120,180,255,0.9)" // ★ 光る
                    : "none",

                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ opacity: 0.85, marginBottom: 4 }}>デコイ</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {Array.from({ length: maxDecoy }).map((_, i) => (
                    <span key={i} style={{ opacity: i < hp ? 1 : 0.25 }}>
                      🛡️
                    </span>
                  ))}
                </div>
              </div>
          </div>

          <StoryPanel log={storyLog} />
  </div>{/*盤面ストーリーパネル終わり*/}


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
        >
          セクター選択に戻る
        </button>
        <button
          onClick={() => setIsLogOpen(true)}
          style={{
            marginBottom: 16,
            padding: "6px 12px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          ログ鑑賞
        </button>
      <LogGalleryModal
        open={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        collection={collection}
      />
      </div>
      
    );
};

export default Game;