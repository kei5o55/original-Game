// src/logic/enemy.ts
import type { Enemy } from "./types";

export function stepEnemy(enemy: Enemy): Enemy {
  const nextIdx = (enemy.idx + 1) % enemy.route.length;
  return {
    ...enemy,
    idx: nextIdx,
  };
}

export function isHitAfterMove(
  player: { x: number; y: number },
  enemies: Enemy[]
): boolean {
  return enemies.some(enemy => {
    const pos = enemy.route[enemy.idx];
    return pos.x === player.x && pos.y === player.y;
  });
}
