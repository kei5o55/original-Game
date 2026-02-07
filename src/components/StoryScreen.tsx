// src/components/StoryScreen.tsx
// 章ごとのストーリースクリーン表示コンポーネント

import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChapterId } from "../logic/types";
import "./Story.css";
import "./img.css";

type StoryScreenProps = {
  chapter: ChapterId;
  phase: "intro" | "outro";
  onFinish: () => void;
};

type Expression = "neutral" | "happy";// 他の表情も追加可能

type StoryLine = {
  text: string;
  expression?: Expression; // 省略したら前の表情を引き継ぐ、みたいにもできる
  fadeAfter?: boolean; // 文章表示後にフェードアウトするかどうか
};

const portraitByExpression: Record<Expression, string> = {
  neutral: "/images/a.png",
  happy: "/images/b.png",
};

const backgroundByChapter: Record<ChapterId, string> = {
  chapter1: "/images/bg1.png",
  chapter2: "/images/bg2.png",
  chapter3: "/images/bg3.png",
  chapter4: "/images/bg4.png",
};



const StoryScreen: React.FC<StoryScreenProps> = ({ chapter, phase, onFinish }) => {
  const speedMs = 25; //数字小さいほど速い
  const [shownText, setShownText] = useState(""); // 画面に表示する途中経過
  const [charIndex, setCharIndex] = useState(0);  // current.text の何文字目まで表示したか
  const [isFading, setIsFading] = useState(false);
  const fadeMs = 250;
  


  
  // 仮：章ごとの文章（あとで外部ファイル化しやすい形）
  const lines = useMemo(() => {
    const map: Record<ChapterId, { intro: StoryLine[]; outro: StoryLine[] }> = {
      chapter1: {
        intro: [
          {text: "1テスト文章です。\n\n\n改行できてる？",expression: "neutral"},
          {text: "次暗転します",expression: "happy", fadeAfter: true},
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

  useEffect(() => {
    setShownText("");
    setCharIndex(0);
  }, [index, chapter, phase]);

  useEffect(() => {
    const full = current.text ?? "";
    if (!full) return;
    if (charIndex >= full.length) return;

    const t = window.setTimeout(() => {
      const next = charIndex + 1;
      setCharIndex(next);
      setShownText(full.slice(0, next));
    }, speedMs);

    return () => window.clearTimeout(t);
  }, [charIndex, current.text, speedMs]);

  const handleNext = () => {//フェード無しでやる時
    if (isLast) {
      onFinish(); // ★ 全文終わったら画面遷移（introならゲームへ）
      return;
    }
    setIndex((i) => i + 1);// 次の文章へ
  };

  const Storyskip = () => {//スキップボタン
      onFinish();      //onfinish呼ぶだけ
  };

  const goNextWithFade = () => {//フェードありでやる時
    if (isFading) return;
    setIsFading(true);

    window.setTimeout(() => {
      handleNext();       // index++ or onFinish()
      setIsFading(false); // 明転（exitアニメが走る）
    }, fadeMs);
  };

  const isTyping = shownText.length < (current.text?.length ?? 0);
  const shouldFade = isLast || !!lines[index]?.fadeAfter;//フェードの判定（最後の文章orfadeAfterがtrueの時）

  const handleClick = () => {// 画面クリック時の挙動
    if (isTyping) {
      // 途中なら全文表示に切り替え
      const full = current.text ?? "";
      setShownText(full);
      setCharIndex(full.length);
      return;
    }
    // 全文出てるなら次へ
    if (shouldFade) {
      goNextWithFade();
    } else {
      handleNext();
    }
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
      onClick={handleClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "#0b1020",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
        cursor: "pointer",
        userSelect: "none",
        overflow: "hidden",
      }}
      className="chapter1-img"
    >
      {/* 背景(主人公画像)：フルサイズで縮小表示 */}
      <img
        src={portraitSrc}
        alt="主人公"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",      // ← ここが「フルサイズ縮小」
          objectPosition: "center",
          filter: "brightness(0.95)",
          pointerEvents: "none",     // クリックは親が拾う
        }}
      />

      {/* 下部メッセージウィンドウ */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "8%",                 // 少し下寄り（好みで調整）
          transform: "translateX(-50%)",

          width: "min(720px, 92vw)",
          padding: "20px 22px",
          background: "rgba(15,23,42,0.88)",
          backdropFilter: "blur(6px)",
          borderRadius: 14,

          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",

          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxHeight: "40vh",
        }}
      >

        {/* ヘッダ（ミッション表示＋skip） */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.85, fontSize: 12 }}>
          <span>{phase === "intro" ? "MISSION START" : "MISSION COMPLETE"} / {chapter}</span>

          <button
            onClick={(e) => { e.stopPropagation(); Storyskip(); }} // ← 親クリックを止める
            style={{
              marginLeft: "auto",
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            skip
          </button>
        </div>

        {/* 本文 */}
        <div
          style={{
            fontSize: 18,
            lineHeight: 1.9,
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            textAlign: "left",
          }}
        >
          {shownText}
        </div>

        {/* フッタ（操作ヒント） */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: 0.75,
            fontSize: 12,
          }}
        >
          <span>{isTyping ? "クリックで全文表示" : isLast ? "クリックで進む" : "クリックで次へ"}</span>
        </div>
      </div>

      {/* フェード（今のままでOK） */}
      <AnimatePresence>
        {isFading && (
          <motion.div
            key="fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{
              position: "fixed",
              inset: 0,
              background: "#000",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>
    </div>

  );
};

export default StoryScreen;