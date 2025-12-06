// src/components/StoryPanel.tsx
import React, { useEffect, useRef } from "react";

type StoryPanelProps = {
  log: string[];
};

const StoryPanel: React.FC<StoryPanelProps> = ({ log }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ログが増えるたびにスクロールを一番下に
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div
      style={{
        width: 320,
        height: 360,
        padding: "8px 10px",
        borderRadius: 8,
        background: "#020617",
        border: "1px solid #1f2937",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 14,
          opacity: 0.9,
          marginBottom: 4,
          borderBottom: "1px solid #1f2937",
          paddingBottom: 4,
        }}
      >
        通信ログ
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {log.length === 0 ? (
          <p style={{ opacity: 0.7 }}>（通信待機中…）</p>
        ) : (
          log.map((line, i) => (
            <p key={i} style={{ margin: "2px 0" }}>
              {line}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

export default StoryPanel;
