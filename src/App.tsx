// src/App.tsx
// アプリケーションのルートコンポーネント

import {motion } from "framer-motion";
import React, { useState } from "react";
import Game from "./components/Game";
import Title from "./components/Title";
import MapSelect from "./components/MapSelect";
import type { ChapterId } from "./logic/types";
import StoryScreen from "./components/StoryScreen";

type Scene =
  | { type: "title" }
  | { type: "select" }
  | { type: "story"; phase: "intro" | "outro" }
  | { type: "game" };

const App: React.FC = () => {
  const [scene, setScene] = useState<Scene>({type:"title"});
  const FADE_MS = 260 as const;
  const [fadePhase, setFadePhase] = useState<"idle" | "in" | "out">("idle");

  const transitionTo = (next: Scene) => {// シーン遷移処理
    if (fadePhase !== "idle") return;

    // 暗転開始
    setFadePhase("in");

    // 暗転が終わった瞬間に画面を切り替える
    window.setTimeout(() => {
      setScene(next);

      // 1フレーム待ってから明転開始（切替のチラつき防止）
      requestAnimationFrame(() => setFadePhase("out"));

      // 明転が終わったら終了
      window.setTimeout(() => setFadePhase("idle"), FADE_MS);
    }, FADE_MS);
  };


  // どの章まで解放されているか
  const [unlockedChapters, setUnlockedChapters] = useState<ChapterId[]>([// 最初は 1 章だけ解放
    "chapter1",
  ]);

  // 今プレイ中の章（ゲーム中以外は null でもOK）
  const [currentChapter, setCurrentChapter] = useState<ChapterId | null>(null);

  // 章クリア時に呼ばれる
  const handleChapterCleared = (chapter: ChapterId) => {//ChapterIDを受け取る(どの章をクリアしたか)
    // クリアした章が chapter1 なら chapter2 を解放…みたいな感じで
    setUnlockedChapters((prev) => {
      const set = new Set(prev);
      set.add(chapter);
      if (chapter === "chapter1") set.add("chapter2");// 1章クリア時に2章解放
      if (chapter === "chapter2") set.add("chapter3");// 2章クリア時に3章解放
      if (chapter === "chapter3") set.add("chapter4");// 3章クリア時に4章解放
      return Array.from(set);// 重複なく配列にして返す
    });

    // クリアしたらアウトロストーリー画面へ
    transitionTo({ type: "story", phase: "outro" });
  };

  return (
    <>
      {scene.type === "title" && (
        <Title onStart={() => transitionTo({ type: "select" })} />// スタートボタンで選択画面へ
      )}

      {scene.type === "select" && (
        <MapSelect
          unlockedChapters={unlockedChapters}// 解放済みの章を渡す
          onSelectChapter={(chapter) => {// 章を選んだらゲーム画面へ
            setCurrentChapter(chapter);// 選んだ章をセット
            transitionTo({ type: "story", phase: "intro" });// ストーリー画面へ
          }}
          onBackTitle={() => transitionTo({ type: "title" })}// タイトルに戻る
        />
      )}

      {scene.type === "story" && currentChapter && (
        <StoryScreen
          chapter={currentChapter}
          phase={scene.phase}
          onFinish={() => {
            if (scene.phase === "intro") {
              transitionTo({ type: "game" });
            } else {
              transitionTo({ type: "select" });
            }
          }}
        />
      )}

      {scene.type === "game" && currentChapter && (// currentChapter が null でないとき
        <Game
          key={currentChapter} // 章が変わったらコンポーネントを再作成してリセット
          chapter={currentChapter}// 今の章を渡す
          onCleared={handleChapterCleared}// クリア時の処理(handleChapterCleared)
          onBackToSelect={() => transitionTo({ type: "select" })}// 選択画面に戻る(ボタンで呼ぶ)
        />
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: fadePhase === "idle" ? 0 : fadePhase === "in" ? 1 : 0 }}
        transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      />

    </>
  );
};

export default App;
