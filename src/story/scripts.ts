// src/story/scripts.ts
import type { StoryLogItem } from "../logic/types";
import type { StepOutcome } from "../logic/board";

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
      return scriptForItem(outcome.item);

    case "safe":
      return scriptForSafe(outcome.neighborMines);
      
    default:
      return [{ type: "text", message: "『……（通信が乱れている）』" }];
  }
}

function scriptForItem(item: "heal" | "reveal" | "shield"|"key"): StoryLogItem[] {
  if (item === "heal") {
    return [
      { type: "event", title: "RECOVER", image: "/images/events/heal.png", message: "回復ポイントを発見！" },
      { type: "text", message: "『助かる！ 応急処置できそう！』" },
    ];
  }
  if (item === "shield") {
    return [
      { type: "event", title: "SHIELD", image: "/images/events/shield.png", message: "防護フィールドを展開！" },
      { type: "text", message: "『これで一回は耐えられるね！』" },
    ];
  }
  // reveal
  return [
    { type: "event", title: "SCAN", image: "/images/events/reveal.png", message: "周囲をスキャン可能！" },
    { type: "text", message: "『索敵できる！ 便利〜！』" },
  ];
}

function scriptForSafe(n: number): StoryLogItem[] {
  if (n > 0) {
    return [{ type: "text", message: `『反応あり……この周囲に ${n} 箇所、危ない場所がある。』` }];
  }
  return [{ type: "text", message: "『ここは静か……問題なさそう。』" }];
}
