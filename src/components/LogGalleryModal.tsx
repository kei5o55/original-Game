import React from "react";
import type { ItemLogEntry } from "./../logic/types";
import { getItemDef } from "../logic/items";

export default function LogGalleryModal({
  open,
  onClose,
  logs,
}: {
  open: boolean;
  onClose: () => void;
  logs: ItemLogEntry[];
}) {
  if (!open) return null;

  const sorted = [...logs].sort((a, b) => b.obtainedAt - a.obtainedAt);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(900px, 100%)",
          maxHeight: "80vh",
          overflow: "auto",
          background: "#0b1020",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>ログ鑑賞（回収記録）</h2>
          <button onClick={onClose} style={{ padding: "6px 10px", borderRadius: 8 }}>
            閉じる
          </button>
        </div>

        {sorted.length === 0 ? (
          <div style={{ opacity: 0.8, marginTop: 12 }}>まだ何も回収してない。</div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {sorted.map((e, idx) => {
              const def = getItemDef(e.itemId);
              return (
                <div
                  key={`${e.itemId}-${idx}-${e.obtainedAt}`}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: "rgba(15,23,42,0.85)",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 700 }}>{def.name}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{e.chapter}</div>
                  </div>
                  <div style={{ marginTop: 8, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {def.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
