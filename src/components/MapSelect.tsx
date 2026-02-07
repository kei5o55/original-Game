// src/components/MapSelect.tsx
import React from "react";
import type { ChapterId } from "../logic/types";

type MapSelectProps = {
  unlockedChapters: ChapterId[];              // 開放済みの章
  onSelectChapter: (chapter: ChapterId) => void;
  onBackTitle: () => void;
};

const chapterList: { id: ChapterId; label: string; description: string }[] = [
  { id: "chapter1", label: "第1章：未踏の大地", description: "Frontier の世界と探索の基礎。" },
  { id: "chapter2", label: "第2章：古代遺構の影", description: "遺跡入口の発見。" },
  { id: "chapter3", label: "第3章：遺跡深層", description: "内部で真実に近づいていく。" },
  { id: "chapter4", label: "第4章：制御核", description: "この世界の“核心”へ。" },
];

const MapSelect: React.FC<MapSelectProps> = ({
  unlockedChapters,
  onSelectChapter,
  onBackTitle,
}) => {
  return (
    <div
    style={{
      minHeight: "100vh",
      width: "100vw",
      background: "#020617",   // ← これを全面に
      display: "flex",
      justifyContent: "center",
      padding: 32,
  }}
  >
  <div
    style={{
      width: "min(1100px, 100%)",
      display: "grid",
      gridTemplateColumns: "360px 1fr",
      gap: 24,
      alignItems: "start",
    }}
  >
    {/* 左：タイトル＆説明 */}
    <div>
      <h2 style={{ fontSize: 32, margin: "0 0 12px" }}>探索セクター選択</h2>
      <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>
        進行したいセクターを選択してください。未解放の章はグレー表示になります。
      </div>

      <button
        onClick={onBackTitle}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 10,
          border: "1px solid #1f2937",
          background: "#ffffff",
          color: "#000000",
          cursor: "pointer",
        }}
      >
        タイトルに戻る
      </button>
    </div>

    {/* 右：章リスト */}
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {chapterList.map((ch) => {
        const unlocked = unlockedChapters.includes(ch.id);
        return (
          <button
            key={ch.id}
            onClick={() => unlocked && onSelectChapter(ch.id)}
            disabled={!unlocked}
            style={{
              textAlign: "left",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #1f2937",
              background: unlocked ? "#ffffff" : "#020617",
              opacity: unlocked ? 1 : 0.4,
              cursor: unlocked ? "pointer" : "not-allowed",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 4 }}>{ch.label}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{ch.description}</div>
            {!unlocked && <div style={{ fontSize: 11, opacity: 0.7 }}>未解放</div>}
          </button>
        );
      })}
    </div>
  </div>
</div>
  );
};

export default MapSelect;
