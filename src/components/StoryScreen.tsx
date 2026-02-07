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
      className="chapter1-img"
    >
      <div
        style={{
          width: "min(720px, 92vw)",
          height:500,
          background: "rgba(15,23,42,0.9)",
          padding: 24,
          borderRadius: 12,
          display:"flex",
          flexDirection:"column",
          gap:12,
        }}
      >
        <div style={{ opacity: 0.75, fontSize: 12}}>
          {phase === "intro" ? "MISSION START" : "MISSION COMPLETE"} / {chapter}
          <button
            onClick={Storyskip}
            style={{
              marginTop: 8,
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
            }}
          >
            skip
          </button>
        </div>
        
        <div style={{ width: 300, height: 300, alignSelf: "center" }}>
          <img
            src={portraitSrc}
            alt="主人公"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
        </div>

        <div style={{ flex:"11 auto",fontSize: 18, lineHeight: 1.9,minHeight: 120,whiteSpace: 'pre-wrap',paddingRight: 6,overflowY: 'auto',background: "rgba(15,23,42,0.9)",textAlign: "left", }}>
          {shownText} {/*テキスト*/}
        </div>
        
        
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: 0.75,
            fontSize: 12,
          }}>
          <span>{isTyping ? "クリックで全文表示" : isLast ? "クリックで進む" : "クリックで次へ"}</span>        </div>
        </div>

      <AnimatePresence>{/* フェードアニメ */}
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