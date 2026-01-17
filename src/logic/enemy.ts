// src/logic/enemy.ts
import type { EnemyState } from "./types";

export function stepEnemy(enemy: EnemyState): EnemyState {
  const nextIdx = (enemy.idx + 1) % enemy.route.length;
  return { ...enemy, idx: nextIdx };
}

type HitKind = "none" | "sameCell" | "crossed";
//type HitResult = { kind: HitKind; enemyIndex?: number };

export type HitResult =
  | { kind: "none" }
  | { kind: "hit"; enemyIndex: number }
  | { kind: "crossed"; enemyIndex: number };

export function isHitAfterMove(
  prevPlayer: { x: number; y: number },
  nextPlayer: { x: number; y: number },
  prevEnemies: EnemyState[],
  nextEnemies: EnemyState[]
): HitResult {
  for (let i = 0; i < nextEnemies.length; i++) {
    const prevE = prevEnemies[i];
    const nextE = nextEnemies[i];

    const prevPos = prevE.route[prevE.idx];
    const nextPos = nextE.route[nextE.idx];

    // ① 同じマス（移動後に重なる）
    if (nextPos.x === nextPlayer.x && nextPos.y === nextPlayer.y) {
      return { kind: "hit", enemyIndex: i };
    }

    // ② すれ違い（入れ替わり）のとき
    const crossed =
      prevPos.x === nextPlayer.x &&
      prevPos.y === nextPlayer.y &&
      nextPos.x === prevPlayer.x &&
      nextPos.y === prevPlayer.y;

    if (crossed) {
      return { kind: "crossed", enemyIndex: i };
    }
  }
  return { kind: "none" };
}
