// src/components/StoryScreen.tsx
import React from "react";
import type { ChapterId } from "../logic/types";

type StoryScreenProps = {
  chapter: ChapterId;
  phase: "intro" | "outro";
  onFinish: () => void;
};

const StoryScreen: React.FC<StoryScreenProps> = ({
  chapter,
  phase,
  onFinish,
}) => {
  // 仮テキスト（あとで外部ファイル化する想定）
  const textMap: Record<ChapterId, { intro: string; outro: string }> = {
    chapter1: {
      intro: "ここは最初のセクター",
      outro: "次のエリアへ向かおう。",
    },
    chapter2: {
      intro: "通信状況が不安定だ……。",
      outro: "新たな異常反応を確認。",
    },
    chapter3: {
      intro: "さらに奥地へ",
      outro: "嫌な予感がする……。",
    },
    chapter4: {
      intro: "最深部",
      outro: "任務完了",
    },
  };

  const text = textMap[chapter][phase];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1020",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          background: "rgba(15,23,42,0.9)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          {phase === "intro" ? "MISSION START" : "MISSION COMPLETE"}
        </h2>

        <p style={{ lineHeight: 1.8, marginBottom: 24 }}>{text}</p>

        <button
          onClick={onFinish}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#2563eb",
            color: "#fff",
            fontSize: 14,
          }}
        >
          {phase === "intro" ? "出撃する" : "次へ"}
        </button>
      </div>
    </div>
  );
};

export default StoryScreen;
