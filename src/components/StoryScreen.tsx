// src/components/StoryScreen.tsx
import React, { useMemo, useState, useEffect } from "react";
import type { ChapterId } from "../logic/types";

type StoryScreenProps = {
  chapter: ChapterId;
  phase: "intro" | "outro";
  onFinish: () => void;
};


type Expression = "neutral" | "happy";// 他の表情も追加可能

type StoryLine = {
  text: string;
  expression?: Expression; // 省略したら前の表情を引き継ぐ、みたいにもできる
};

const portraitByExpression: Record<Expression, string> = {
  neutral: "/images/a.png",
  happy: "/images/b.png",
};



const StoryScreen: React.FC<StoryScreenProps> = ({ chapter, phase, onFinish }) => {
  // 仮：章ごとの文章（あとで外部ファイル化しやすい形）
  const lines = useMemo(() => {
    const map: Record<ChapterId, { intro: StoryLine[]; outro: StoryLine[] }> = {
      chapter1: {
        intro: [
          {text: "1テスト文章です。\n\n\n改行できてる？",expression: "neutral"},
          {text: "2",expression: "happy"},
          {text: "3"},
          {text: "ここは多分普通"}
        ],
        outro: [
          {text: "4"},
          {text: "5"},
        ],
      },
      chapter2: {
        intro: [{text: "6"}],
        outro: [{text: "7"}],
      },
      chapter3: {
        intro: [{text: "8"}],
        outro: [{text: "9"}],
      },
      chapter4: {
        intro: [{text: "10"}],
        outro: [{text: "11"}],
      },
    };

    return map[chapter][phase];
  }, [chapter, phase]);

  const [index, setIndex] = useState(0);

  const isLast = index >= lines.length - 1;

  const current = lines[index] ?? { text: "" };

  const handleNext = () => {
    if (isLast) {
      onFinish(); // ★ 全文終わったら画面遷移（introならゲームへ）
      return;
    }
    setIndex((i) => i + 1);// 次の文章へ
  };

  const currentExpression = useMemo<Expression>(() => {
    let expr: Expression = "neutral";
    for (let i = 0; i <= index; i++) {
        const e = lines[i]?.expression;//
        if (e) expr = e;
    }
    return expr;
    }, [lines, index]);

    const portraitSrc = portraitByExpression[currentExpression];

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
          height:400,
          background: "rgba(15,23,42,0.9)",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          display:"flex",
          flexDirection:"column",
          gap:12,
        }}
      >
        <div style={{ opacity: 0.75, fontSize: 12}}>
          {phase === "intro" ? "MISSION START" : "MISSION COMPLETE"} / {chapter}
        </div>
        
        <img //人物画像
            src={portraitSrc}
            alt="主人公"
            style={{
                width: "55%",
                height: "auto",
                borderRadius: 8,
                objectFit: "cover",
                marginBottom: 8,
                alignSelf: "center",
            }}
        />

        <div style={{ flex:"11 auto",fontSize: 18, lineHeight: 1.9,minHeight: 120,whiteSpace: 'pre-wrap',paddingRight: 6,overflowY: 'auto', }}>
          {current.text} {/*テキスト*/}
        </div>
        
        
        <div
        
          style={{
            marginTop: "auto",
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
