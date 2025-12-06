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
        background: "#020617",
        color: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 32,
      }}
    >
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>探索セクター選択</h2>

      <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 12 }}>
        {chapterList.map((ch) => {
          const unlocked = unlockedChapters.includes(ch.id);
          return (
            <button
              key={ch.id}
              onClick={() => unlocked && onSelectChapter(ch.id)}
              disabled={!unlocked}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: unlocked ? "#0f172a" : "#020617",
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

      <button
        onClick={onBackTitle}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
        }}
      >
        タイトルに戻る
      </button>
    </div>
  );
};

export default MapSelect;
