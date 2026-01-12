// src/logic/enemySpawns.ts配置はここだけ触る
import type { ChapterId, EnemyId } from "./types";

export type EnemySpawn = {
  enemyId: EnemyId;
  uid: string; // "c1-e1" みたいに固定でもOK
  route: { x: number; y: number }[];
};

export const ENEMY_SPAWNS_BY_CHAPTER: Record<ChapterId, EnemySpawn[]> = {
  chapter1: [
    {
      enemyId: "scout",
      uid: "c1-e1",// 固定ID(全敵体でユニーク)
      route: [{ x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 2 }],//一番左が初期位置
    }, {
      enemyId: "scout",
      uid: "c1-e2",
      route: [{ x: 1, y: 1 }, { x: 1, y: 2 }],
    }
  ],
  chapter2: [
    {
      enemyId: "guard",
      uid: "c2-e1",
      route: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    },
    {
      enemyId: "scout",
      uid: "c2-e2",
      route: [{ x: 6, y: 6 }, { x: 6, y: 7 }, { x: 7, y: 7 }],
    },
  ],
  chapter3: [],
  chapter4: [],
};
