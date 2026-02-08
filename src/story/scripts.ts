// src/story/scripts.ts
import type { StoryLogItem } from "../logic/types";
import type { StepOutcome } from "../logic/board";
import { getItemDef } from "../logic/items";

export type ScriptContext = {
  chapter: string; // 必要なら ChapterId に
  neighborMines?: number;
};

export function scriptForOutcome(outcome: StepOutcome, ctx: ScriptContext): StoryLogItem[] {
  switch (outcome.type) {
    case "mine":
      return [
        { type: "event", title: "WARNING", image: "/images/events/mine.png", message: "地雷を踏んでしまった……！" },
        { type: "text", message: "『……っ！ 今の、踏んだ……！』" },
      ];

    case "pickup":
      return scriptForItemPickup(outcome.itemId, ctx);

    case "safe":
      return scriptForSafe(outcome.neighborMines);

    // event / goal もここで統一したいなら後で足せる
    default:
      return [{ type: "text", message: "『……（通信が乱れている）』" }];
  }
}

function scriptForItemPickup(itemId: Parameters<typeof getItemDef>[0], _ctx: ScriptContext): StoryLogItem[] {
  const def = getItemDef(itemId);

  // ここが「演出の辞書」
  // itemIdごとに eventカードの見た目（タイトル/画像/メッセージ）だけ定義する
  const preset = ITEM_PICKUP_PRESET[itemId] ?? {
    title: "DATA",
    image: "/images/events/item.png",
    message: `資料を回収：${def.name}`,
  };

  return [
    { type: "event", title: preset.title, image: preset.image, message: preset.message },
    { type: "text", message: def.short }, // ★短文はitems.tsのものを使う
  ];
}

// itemId -> 演出プリセット（タイトル/画像/メッセージだけ）
const ITEM_PICKUP_PRESET: Record<
  Parameters<typeof getItemDef>[0],
  { title: string; image: string; message: string }
> = {
  a: {
    title: "LOG",
    image: "/images/events/log.png",
    message: "アイテムAを回収した。",
  },
  b: {
    title: "CONFIDENTIAL",
    image: "/images/events/confidential.png",
    message: "アイテムBを確保した。",
  },
  c: {
    title: "MANUAL",
    image: "/images/events/manual.png",
    message: "アイテムCを入手。",
  },
};

function scriptForSafe(n: number): StoryLogItem[] {
  if (n > 0) {
    return [{ type: "text", message: `『反応あり……この周囲に ${n} 箇所、危ない場所がある。』` }];
  }
  return [{ type: "text", message: "『ここは静か……問題なさそう。』" }];
}


