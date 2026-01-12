// src/logic/enemyDefs.ts
import type { EnemyDef, EnemyId } from "./types";

export const ENEMIES: Record<EnemyId, EnemyDef> = {
  scout:   { id: "scout",   name: "偵察機", sprite: "👾", atk: 1, maxHp: 1, speed: 1 },//speedから行動頻度を変えたい
  guard:   { id: "guard",   name: "守衛",   sprite: "👺", atk: 2, maxHp: 3 },
  stalker: { id: "stalker", name: "追跡者", sprite: "🕷️", atk: 3, maxHp: 2 },
};

export const getEnemyDef = (id: EnemyId) => ENEMIES[id];
