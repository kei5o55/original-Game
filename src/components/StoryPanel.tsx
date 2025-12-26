// src/components/StoryPanel.tsx
import React, { useEffect, useRef } from "react";
import type { StoryLogItem } from "../logic/types";

type StoryPanelProps = {
  log: StoryLogItem[];
};

const StoryPanel: React.FC<StoryPanelProps> = ({ log }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ★ログが追加されたら自動スクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth", // "auto" にすると瞬間移動
    });
  }, [log]);

  return (
    <div
      style={{
        width: 320,
        maxHeight: 320,
        overflowY: "auto",
        padding: 12,
        background: "rgba(15,23,42,0.85)",
        borderRadius: 8,
        boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      {log.map((item, i) => {
        if (item.type === "text") {
          return (
            <div key={i} style={{ marginBottom: 6, opacity: 0.92 }}>
              {item.message}
            </div>
          );
        }

        if (item.type === "image") {
          return (
            <img
              key={i}
              src={item.src}
              alt={item.alt ?? ""}
              style={{
                width: "100%",
                borderRadius: 8,
                margin: "8px 0",
                display: "block",
              }}
            />
          );
        }

        // event
        return (
          <div
            key={i}
            style={{
              margin: "10px 0",
              padding: 10,
              borderRadius: 10,
              background: "rgba(2,6,23,0.6)",
              border: "1px solid rgba(148,163,184,0.25)",
            }}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{ width: "100%", borderRadius: 8, marginBottom: 6 }}
            />
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              {item.title}
            </div>
            {item.message && (
              <div style={{ opacity: 0.9 }}>{item.message}</div>
            )}
          </div>
        );
      })}

      {/* ★スクロール終端マーカー */}
      <div ref={bottomRef} />
    </div>
  );
};

export default StoryPanel;
