// src/logic/items.ts
export type ItemId = "heal" | "key" | "gem" | "note";

export type ItemDef = {
  id: ItemId;
  name: string;
  pickupLog: string; // 拾った時に出すログ
};

export const ITEMS: Record<ItemId, ItemDef> = {
  heal: { id: "heal", name: "回復薬", pickupLog: "回復薬を拾った。" },
  key: { id: "key", name: "鍵", pickupLog: "鍵を拾った。どこかの扉が開きそうだ。" },
  gem: { id: "gem", name: "結晶片", pickupLog: "結晶片を拾った。淡く光っている。" },
  note: { id: "note", name: "メモ", pickupLog: "メモを拾った。文字がかすれて読みにくい。" },
};
