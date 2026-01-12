// src/logic/enemy.ts
import type { EnemyState } from "./types";

export function stepEnemy(enemy: EnemyState): EnemyState {
  const nextIdx = (enemy.idx + 1) % enemy.route.length;
  return { ...enemy, idx: nextIdx };
}

export function isHitAfterMove(
  player: { x: number; y: number },
  enemies: EnemyState[]
): boolean {
  return enemies.some(e => {
    const pos = e.route[e.idx];
    return pos.x === player.x && pos.y === player.y;
  });
}
