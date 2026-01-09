// src/components/StoryScreen.tsx
import React, { useMemo, useState } from "react";
import type { ChapterId } from "../logic/types";

type StoryScreenProps = {
  chapter: ChapterId;
  phase: "intro" | "outro";
  onFinish: () => void;
};

const character = {
  a: "/images/a.png",
  b: "/images/a.png",
  c: "/images/a.png",
};

const StoryScreen: React.FC<StoryScreenProps> = ({ chapter, phase, onFinish }) => {
  // 仮：章ごとの文章（あとで外部ファイル化しやすい形）
  const lines = useMemo(() => {
    const map: Record<ChapterId, { intro: string[]; outro: string[] }> = {
      chapter1: {
        intro: [
          "1テスト文章です。\n\n改行できてる？",
          "2",
          "3",
        ],
        outro: [
          "4",
          "5",
        ],
      },
      chapter2: {
        intro: ["6"],
        outro: ["7"],
      },
      chapter3: {
        intro: ["8"],
        outro: ["9"],
      },
      chapter4: {
        intro: ["10"],
        outro: ["11"],
      },
    };

    return map[chapter][phase];
  }, [chapter, phase]);

  const [index, setIndex] = useState(0);

  const isLast = index >= lines.length - 1;
  const currentLine = lines[index] ?? "";

  const handleNext = () => {
    if (isLast) {
      onFinish(); // ★ 全文終わったら画面遷移（introならゲームへ）
      return;
    }
    setIndex((i) => i + 1);
  };

  return (
    <div
      onClick={handleNext}
      style={{
        position:"fixed",
        inset:"0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b1020",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
        padding: 24,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "min(720px, 92vw)",
          minHeight:180,
          background: "rgba(15,23,42,0.9)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-between",
        }}
      >
        <div style={{ opacity: 0.75, fontSize: 12, marginBottom: 10 }}>
          {phase === "intro" ? "MISSION START" : "MISSION COMPLETE"} / {chapter}
        </div>

        <div style={{ fontSize: 18, lineHeight: 1.9, minHeight: 90,whiteSpace: 'pre-wrap'}}>
          {currentLine}
        </div>
        
        <img
              src={character.a}
              alt="主人公"
              style={{
                width: "50%",
                height: "auto",
                borderRadius: 8,
                objectFit: "cover",
                marginBottom: 8,
              }}
            />
        <div
        
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: 0.75,
            fontSize: 12,
          }}
        >
          <span>
            {index + 1} / {lines.length}
          </span>
          <span>{isLast ? "クリックで進む" : "クリックで次へ"}</span>
        </div>
      </div>
    </div>
  );
};

export default StoryScreen;
