### 敵関連の処理(../logic/enemy.ts)
  - stepEnemy:敵を次の移動先へ進める処理．各ターン終わりに実行
    - enemy.idx(今どの地点にいるか（route の添字）)
    - return { ...enemy, idx: nextIdx };
        { ...enemy }
        → 元の敵データをコピー
    - idx: nextIdx
        → idx だけ新しい値に置き換える

  - Hitkind:衝突処理時の衝突の種類をもつ変数．none=衝突していない.sameCell=セル上の衝突．crossed=同じ道を通る衝突
  - HitResult:HitKimd（衝突の種類），enemyIndex(敵のナンバー)を持つ変数．

  - getEnemydef:enemyIdをもとに，敵の名前や最大HP,見た目(スプライト)などの定義データを取得
  - isHitAftermore:プレイヤーの行動毎に呼び出される．現プレイヤー位置（ｘ，ｙ，）更新後プレイヤー位置（ｘ，ｙ，）現敵位置（ｘ，ｙ，）更新後敵位置（ｘ，ｙ，）を受け取り，衝突しているかの処理を行う．（複数敵を配置した時の不具合ってここじゃね？）
  - 
