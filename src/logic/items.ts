// src/logic/items.ts
export type ItemId =
  | "a"
  | "b"
  | "c";

export type ItemDef = {
  id: ItemId;
  name: string;
  short: string;     // ゲーム中に出す短文
  description?: string; // 鑑賞用の長文
  rarity?: "common" | "rare" | "legend";
  chapterHint?: string; // 任意：どの章っぽいか等
};

export const ITEMS: Record<ItemId, ItemDef> = {
  a: {
    id: "a",
    name: "名前a",
    short: "『助かる！ 応急処置できそう！（aの短文』",
    description:
      "ここに長文",
    rarity: "common",
    chapterHint: "chapter1",
  },
  b: {
    id: "b",
    name: "名前ｂ",
    short: "『これで一回は耐えられるね！(bの短文』",
    chapterHint: "chapter2",
  },
  c: {
    id: "c",
    name: "名前ｃ",
    short: "『索敵できる！ 便利〜！(cの短文』",
    rarity: "common",
  },
};

export const getItemDef = (id: ItemId) => ITEMS[id];
