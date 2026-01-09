// src/App.tsx
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
    setScene({type:"story",phase:"outro"});
  };

  return (
    <>
      {scene.type === "title" && (
        <Title onStart={() => setScene({type:"select"})} />
      )}

      {scene.type === "select" && (
        <MapSelect
          unlockedChapters={unlockedChapters}// 解放済みの章を渡す
          onSelectChapter={(chapter) => {// 章を選んだらゲーム画面へ
            setCurrentChapter(chapter);// 選んだ章をセット
            setScene({type:"story",phase:"intro"});// ストーリー画面へ
          }}
          onBackTitle={() => setScene({type:"title"})}// タイトルに戻る
        />
      )}

      {scene.type === "story" && currentChapter && (
        <StoryScreen
          chapter={currentChapter}
          phase={scene.phase}
          onFinish={() => {
            if (scene.phase === "intro") {
              setScene({ type: "game" });
            } else {
              setScene({ type: "select" });
            }
          }}
        />
      )}

      {scene.type === "game" && currentChapter && (// currentChapter が null でないとき
        <Game
          key={currentChapter} // 章が変わったらコンポーネントを再作成してリセット
          chapter={currentChapter}// 今の章を渡す
          onCleared={handleChapterCleared}// クリア時の処理(handleChapterCleared)
          onBackToSelect={() => setScene({type:"select"})}// 選択画面に戻る(ボタンで呼ぶ)
        />
      )}
    </>
  );
};

export default App;
