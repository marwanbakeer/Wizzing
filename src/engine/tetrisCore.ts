import {
  type TetrominoType,
  type SpecialBlockType,
  type CellData,
  type RotationState,
  TETROMINOES,
  JLSTZ_KICKS,
  I_KICKS
} from './tetrominoes';
import type { StageConfig } from './stages';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const BUFFER_HEIGHT = 4;
export const TOTAL_HEIGHT = BOARD_HEIGHT + BUFFER_HEIGHT; // 24 rows

export interface ActivePiece {
  type: TetrominoType;
  special: SpecialBlockType;
  rotation: RotationState;
  x: number; // 0-indexed column
  y: number; // 0-indexed row from top (0..23)
}

export interface ClearEvent {
  lines: number;
  clearedRows: number[];
  combo: number;
  isWizz: boolean;
  scoreGained: number;
  bombDetonations?: { x: number; y: number }[];
}

export interface GameStats {
  score: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  wizzCount: number; // 4-line clears
  stageId: number;
  bossHpRemaining?: number;
}

export class TetrisCore {
  public grid: (CellData | null)[][]; // [row][col], total 24 rows, 10 cols
  public activePiece: ActivePiece | null = null;
  public holdPiece: { type: TetrominoType; special: SpecialBlockType } | null = null;
  public canHold: boolean = true;
  public nextQueue: { type: TetrominoType; special: SpecialBlockType }[] = [];
  
  public stats: GameStats;
  public currentStage: StageConfig | null = null;
  public isGameOver: boolean = false;
  public isStageComplete: boolean = false;
  public isPaused: boolean = false;

  private bag: TetrominoType[] = [];
  private lockMoveCount: number = 0;
  private readonly MAX_LOCK_MOVES = 15;
  private lastFallTime: number = 0;
  private laserTimer: number = 0;
  private quakeTimer: number = 0;

  // Listeners
  public onClearCallback?: (event: ClearEvent) => void;
  public onGameOverCallback?: () => void;
  public onStageCompleteCallback?: (stats: GameStats) => void;
  public onBossHitCallback?: (damage: number, remaining: number) => void;

  constructor() {
    this.grid = this.createEmptyGrid();
    this.stats = {
      score: 0,
      lines: 0,
      level: 1,
      combo: -1,
      maxCombo: 0,
      wizzCount: 0,
      stageId: 1
    };
  }

  public initStage(stage: StageConfig, initialScore: number = 0) {
    this.grid = this.createEmptyGrid();
    this.currentStage = stage;
    this.isGameOver = false;
    this.isStageComplete = false;
    this.holdPiece = null;
    this.canHold = true;
    this.bag = [];
    this.nextQueue = [];
    this.lockMoveCount = 0;
    this.laserTimer = 0;
    this.quakeTimer = 0;

    this.stats = {
      score: initialScore,
      lines: 0,
      level: stage.id,
      combo: -1,
      maxCombo: 0,
      wizzCount: 0,
      stageId: stage.id,
      bossHpRemaining: stage.bossHealth
    };

    // Pre-populate 5 next pieces
    for (let i = 0; i < 5; i++) {
      this.nextQueue.push(this.generateNextPiece());
    }

    this.spawnPiece();
    this.lastFallTime = performance.now();
  }

  private createEmptyGrid(): (CellData | null)[][] {
    return Array.from({ length: TOTAL_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => null)
    );
  }

  private getFromBag(): TetrominoType {
    if (this.bag.length === 0) {
      this.bag = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
      // Fisher-Yates shuffle
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop()!;
  }

  private generateNextPiece(): { type: TetrominoType; special: SpecialBlockType } {
    const type = this.getFromBag();
    let special: SpecialBlockType = 'NORMAL';

    if (this.currentStage) {
      const rand = Math.random();
      if (this.currentStage.hasBombs && rand < 0.15) {
        special = 'BOMB';
      } else if (this.currentStage.hasQuantum && rand < 0.15) {
        special = 'QUANTUM';
      } else if (this.currentStage.hasIce && rand < 0.18) {
        special = 'FROZEN';
      } else if (rand < 0.08) {
        special = 'GOLD';
      }
    }

    return { type, special };
  }

  private spawnPiece() {
    const next = this.nextQueue.shift()!;
    this.nextQueue.push(this.generateNextPiece());

    const def = TETROMINOES[next.type];
    const matrix = def.matrix[0];
    const spawnX = Math.floor((BOARD_WIDTH - matrix[0].length) / 2);
    const spawnY = BUFFER_HEIGHT - 2; // In buffer zone

    this.activePiece = {
      type: next.type,
      special: next.special,
      rotation: 0,
      x: spawnX,
      y: spawnY
    };

    this.canHold = true;
    this.lockMoveCount = 0;

    // Check collision on spawn
    if (this.checkCollision(this.activePiece.x, this.activePiece.y, this.activePiece.rotation, this.activePiece.type)) {
      this.isGameOver = true;
      if (this.onGameOverCallback) this.onGameOverCallback();
    }
  }

  public moveLeft(): boolean {
    if (!this.activePiece || this.isGameOver || this.isPaused) return false;
    if (!this.checkCollision(this.activePiece.x - 1, this.activePiece.y, this.activePiece.rotation, this.activePiece.type)) {
      this.activePiece.x -= 1;
      this.resetLockDelayOnMove();
      return true;
    }
    return false;
  }

  public moveRight(): boolean {
    if (!this.activePiece || this.isGameOver || this.isPaused) return false;
    if (!this.checkCollision(this.activePiece.x + 1, this.activePiece.y, this.activePiece.rotation, this.activePiece.type)) {
      this.activePiece.x += 1;
      this.resetLockDelayOnMove();
      return true;
    }
    return false;
  }

  public rotate(clockwise: boolean = true): boolean {
    if (!this.activePiece || this.isGameOver || this.isPaused) return false;
    const currentRot = this.activePiece.rotation;
    const nextRot: RotationState = ((currentRot + (clockwise ? 1 : 3)) % 4) as RotationState;
    const transitionKey = `${currentRot}->${nextRot}`;

    const kicks = this.activePiece.type === 'I'
      ? (I_KICKS[transitionKey] || [[0, 0]])
      : (JLSTZ_KICKS[transitionKey] || [[0, 0]]);

    for (const [kx, ky] of kicks) {
      const testX = this.activePiece.x + kx;
      const testY = this.activePiece.y - ky; // grid coords invert Y
      if (!this.checkCollision(testX, testY, nextRot, this.activePiece.type)) {
        this.activePiece.rotation = nextRot;
        this.activePiece.x = testX;
        this.activePiece.y = testY;
        this.resetLockDelayOnMove();
        return true;
      }
    }
    return false;
  }

  public softDrop(): boolean {
    if (!this.activePiece || this.isGameOver || this.isPaused) return false;
    if (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.rotation, this.activePiece.type)) {
      this.activePiece.y += 1;
      this.stats.score += 1;
      return true;
    } else {
      this.lockPiece();
      return false;
    }
  }

  public hardDrop(): number {
    if (!this.activePiece || this.isGameOver || this.isPaused) return 0;
    let dropDistance = 0;
    while (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.rotation, this.activePiece.type)) {
      this.activePiece.y += 1;
      dropDistance++;
    }
    this.stats.score += dropDistance * 2;
    this.lockPiece();
    return dropDistance;
  }

  public hold(): boolean {
    if (!this.activePiece || !this.canHold || this.isGameOver || this.isPaused) return false;

    const current = { type: this.activePiece.type, special: this.activePiece.special };
    if (this.holdPiece === null) {
      this.holdPiece = current;
      this.spawnPiece();
    } else {
      const prevHold = this.holdPiece;
      this.holdPiece = current;
      this.activePiece = {
        type: prevHold.type,
        special: prevHold.special,
        rotation: 0,
        x: Math.floor((BOARD_WIDTH - TETROMINOES[prevHold.type].matrix[0][0].length) / 2),
        y: BUFFER_HEIGHT - 2
      };
    }
    this.canHold = false;
    return true;
  }

  public getGhostY(): number {
    if (!this.activePiece) return 0;
    let ghostY = this.activePiece.y;
    while (!this.checkCollision(this.activePiece.x, ghostY + 1, this.activePiece.rotation, this.activePiece.type)) {
      ghostY++;
    }
    return ghostY;
  }

  private resetLockDelayOnMove() {
    if (this.lockMoveCount < this.MAX_LOCK_MOVES) {
      this.lockMoveCount++;
      // Reset lock delay
      this.lastFallTime = performance.now();
    }
  }

  private checkCollision(x: number, y: number, rot: RotationState, type: TetrominoType): boolean {
    const matrix = TETROMINOES[type].matrix[rot];
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const boardX = x + c;
          const boardY = y + r;

          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= TOTAL_HEIGHT) {
            return true;
          }
          if (boardY >= 0 && this.grid[boardY][boardX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public update(now: number) {
    if (this.isGameOver || this.isStageComplete || this.isPaused || !this.activePiece) return;

    // Stage special hazard timers
    if (this.currentStage?.hasLaserSweeper) {
      this.laserTimer += 16;
      if (this.laserTimer > 16000) { // Every 16 seconds
        this.laserTimer = 0;
        this.executeLaserSweep();
      }
    }

    if (this.currentStage?.hasSeismicQuake) {
      this.quakeTimer += 16;
      if (this.quakeTimer > 20000) { // Every 20 seconds
        this.quakeTimer = 0;
        this.executeSeismicQuake();
      }
    }

    const fallInterval = this.currentStage ? this.currentStage.speedMs : 800;
    if (now - this.lastFallTime > fallInterval) {
      this.lastFallTime = now;
      if (!this.checkCollision(this.activePiece.x, this.activePiece.y + 1, this.activePiece.rotation, this.activePiece.type)) {
        this.activePiece.y += 1;
      } else {
        this.lockPiece();
      }
    }
  }

  private lockPiece() {
    if (!this.activePiece) return;
    const { type, special, rotation, x, y } = this.activePiece;
    const matrix = TETROMINOES[type].matrix[rotation];
    const color = TETROMINOES[type].color;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const targetY = y + r;
          const targetX = x + c;
          if (targetY >= 0 && targetY < TOTAL_HEIGHT) {
            this.grid[targetY][targetX] = {
              type,
              special,
              color,
              hitsNeeded: special === 'FROZEN' ? 2 : undefined
            };
          }
        }
      }
    }

    this.activePiece = null;
    this.checkLines();
  }

  private checkLines() {
    const fullRowIndices: number[] = [];
    const bombDetonations: { x: number; y: number }[] = [];

    // Scan for full rows
    for (let r = TOTAL_HEIGHT - 1; r >= 0; r--) {
      let isFull = true;
      for (let c = 0; c < BOARD_WIDTH; c++) {
        if (this.grid[r][c] === null) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        fullRowIndices.push(r);
      }
    }

    if (fullRowIndices.length > 0) {
      this.stats.combo += 1;
      this.stats.maxCombo = Math.max(this.stats.maxCombo, this.stats.combo);

      // Process Bomb detonators or Frozen armor blocks
      for (const row of fullRowIndices) {
        for (let c = 0; c < BOARD_WIDTH; c++) {
          const cell = this.grid[row][c];
          if (cell && cell.special === 'BOMB') {
            bombDetonations.push({ x: c, y: row });
            // Explode 3x3 surrounding
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const ex = c + dx;
                const ey = row + dy;
                if (ex >= 0 && ex < BOARD_WIDTH && ey >= 0 && ey < TOTAL_HEIGHT) {
                  this.grid[ey][ex] = null;
                }
              }
            }
          }
        }
      }

      // Remove cleared full rows
      for (const row of fullRowIndices) {
        for (let y = row; y > 0; y--) {
          this.grid[y] = [...this.grid[y - 1]];
        }
        this.grid[0] = Array.from({ length: BOARD_WIDTH }, () => null);
      }

      const linesCount = fullRowIndices.length;
      this.stats.lines += linesCount;
      const isWizz = linesCount >= 4;
      if (isWizz) this.stats.wizzCount += 1;

      // Scoring calculation
      const baseScores = [0, 100, 300, 500, 800];
      const levelMult = this.stats.level;
      let gained = (baseScores[Math.min(linesCount, 4)] || 1000) * levelMult;
      if (this.stats.combo > 0) {
        gained += this.stats.combo * 50 * levelMult;
      }
      this.stats.score += gained;

      // Boss damage
      if (this.currentStage?.bossHealth && this.stats.bossHpRemaining !== undefined) {
        const damage = linesCount * 120 + (isWizz ? 250 : 0) + this.stats.combo * 40;
        this.stats.bossHpRemaining = Math.max(0, this.stats.bossHpRemaining - damage);
        if (this.onBossHitCallback) {
          this.onBossHitCallback(damage, this.stats.bossHpRemaining);
        }
      }

      if (this.onClearCallback) {
        this.onClearCallback({
          lines: linesCount,
          clearedRows: fullRowIndices,
          combo: this.stats.combo,
          isWizz,
          scoreGained: gained,
          bombDetonations: bombDetonations.length > 0 ? bombDetonations : undefined
        });
      }

      // Check Stage Completion
      const linesMet = this.currentStage && this.stats.lines >= this.currentStage.targetLines;
      const bossDefeated = this.currentStage?.bossHealth ? (this.stats.bossHpRemaining !== undefined && this.stats.bossHpRemaining <= 0) : true;

      if (linesMet && bossDefeated) {
        this.isStageComplete = true;
        if (this.onStageCompleteCallback) {
          this.onStageCompleteCallback(this.stats);
        }
        return;
      }
    } else {
      this.stats.combo = -1;
    }

    // Check if any block exists in hidden buffer rows above line 4 -> Game Over
    for (let r = 0; r < BUFFER_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        if (this.grid[r][c] !== null) {
          this.isGameOver = true;
          if (this.onGameOverCallback) this.onGameOverCallback();
          return;
        }
      }
    }

    this.spawnPiece();
  }

  private executeLaserSweep() {
    // Vaporize the lowest occupied row
    for (let r = TOTAL_HEIGHT - 1; r >= BUFFER_HEIGHT; r--) {
      const hasBlock = this.grid[r].some(c => c !== null);
      if (hasBlock) {
        for (let y = r; y > 0; y--) {
          this.grid[y] = [...this.grid[y - 1]];
        }
        this.grid[0] = Array.from({ length: BOARD_WIDTH }, () => null);
        break;
      }
    }
  }

  private executeSeismicQuake() {
    // Push up 1 garbage row with 1 random hole
    const holeIdx = Math.floor(Math.random() * BOARD_WIDTH);
    const garbageRow: (CellData | null)[] = Array.from({ length: BOARD_WIDTH }, (_, i) => {
      if (i === holeIdx) return null;
      return {
        type: 'O',
        special: 'NORMAL',
        color: '#64748b' // Slate garbage block
      };
    });

    for (let y = 0; y < TOTAL_HEIGHT - 1; y++) {
      this.grid[y] = [...this.grid[y + 1]];
    }
    this.grid[TOTAL_HEIGHT - 1] = garbageRow;
  }
}
