//import React from "react";
import type { ItemId } from "../logic/items";
import { ITEMS } from "../logic/items";

export default function LogGalleryModal({
  open,
  onClose,
  collection,
}: {
  open: boolean;
  onClose: () => void;
  collection: Set<ItemId>;
}) {
  if (!open) return null;

  const all = Object.values(ITEMS); // 全アイテム固定

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
          <h2 style={{ margin: 0 }}>ログ鑑賞（資料室）</h2>
          <button onClick={onClose} style={{ padding: "6px 10px", borderRadius: 8 }}>
            閉じる
          </button>
        </div>

        <div style={{ opacity: 0.8, fontSize: 12, marginTop: 8 }}>
          解放状況：{Array.from(collection).length} / {all.length}
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {all.map((def) => {
            const unlocked = collection.has(def.id);

            return (
              <div
                key={def.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(15,23,42,0.85)",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
                  opacity: unlocked ? 1 : 0.6,
                  filter: unlocked ? "none" : "blur(0.2px)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700 }}>
                    {unlocked ? def.name : "？？？"}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {unlocked ? "UNLOCKED" : "LOCKED"}
                  </div>
                </div>

                <div style={{ marginTop: 8, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {unlocked ? def.description : "未回収。断片的な情報しか復元できない。"}
                </div>

                {/* ヒントを出したいなら（任意） */}
                {(!unlocked && def.chapterHint) && (
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    ヒント：{def.chapterHint} に痕跡があるかもしれない
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
