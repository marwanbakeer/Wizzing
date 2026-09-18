import React, { useRef, useEffect } from 'react';
import { TetrisCore, BOARD_WIDTH, BOARD_HEIGHT, BUFFER_HEIGHT } from '../engine/tetrisCore';
import { THEMES, TETROMINOES, type ThemeId, type TetrominoType } from '../engine/tetrominoes';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Floater {
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
}

interface GameBoardProps {
  core: TetrisCore;
  themeId: ThemeId;
  screenShakeEnabled?: boolean;
  seniorMode?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  core,
  themeId,
  screenShakeEnabled = true,
  seniorMode = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatersRef = useRef<Floater[]>([]);
  const shakeRef = useRef<{ x: number; y: number; intensity: number }>({ x: 0, y: 0, intensity: 0 });

  // Hook into core callbacks for visual juice
  useEffect(() => {
    core.onClearCallback = (event) => {
      // Trigger particles for each cleared row
      event.clearedRows.forEach((rowIdx) => {
        const boardY = rowIdx - BUFFER_HEIGHT;
        for (let c = 0; c < BOARD_WIDTH; c++) {
          const color = event.isWizz ? '#00f2fe' : (event.lines >= 3 ? '#f59e0b' : '#38bdf8');
          for (let p = 0; p < (event.isWizz ? 12 : 5); p++) {
            particlesRef.current.push({
              x: c + 0.5,
              y: boardY + 0.5,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.7) * 8,
              size: Math.random() * 4 + 2,
              color,
              alpha: 1,
              decay: Math.random() * 0.02 + 0.02
            });
          }
        }
      });

      // Floater text
      let text = `+${event.scoreGained}`;
      if (event.isWizz) text = `WIZZ! +${event.scoreGained}`;
      else if (event.lines === 3) text = `TRIPLE! +${event.scoreGained}`;
      else if (event.lines === 2) text = `DOUBLE! +${event.scoreGained}`;
      if (event.combo > 0) text += ` (x${event.combo + 1})`;

      floatersRef.current.push({
        text,
        x: BOARD_WIDTH / 2,
        y: (event.clearedRows[0] - BUFFER_HEIGHT),
        color: event.isWizz ? '#00f2fe' : '#fbbf24',
        alpha: 1,
        vy: -0.04
      });

      // Screen shake
      if (screenShakeEnabled) {
        shakeRef.current.intensity = event.isWizz ? 10 : (event.lines >= 3 ? 6 : 3);
      }
    };
  }, [core, themeId, screenShakeEnabled]);

  // Main Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = (time: number) => {
      core.update(time);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Handle screen shake decay
      let shakeX = 0;
      let shakeY = 0;
      if (shakeRef.current.intensity > 0.1) {
        shakeX = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeY = (Math.random() - 0.5) * shakeRef.current.intensity;
        shakeRef.current.intensity *= 0.88;
      }
      ctx.translate(shakeX, shakeY);

      // Dimensions
      const blockSize = Math.floor(Math.min(displayWidth / BOARD_WIDTH, displayHeight / BOARD_HEIGHT));
      const offsetX = Math.floor((displayWidth - blockSize * BOARD_WIDTH) / 2);
      const offsetY = Math.floor((displayHeight - blockSize * BOARD_HEIGHT) / 2);

      const theme = THEMES[themeId];

      // Draw Board Background
      ctx.fillStyle = theme.bg;
      ctx.fillRect(offsetX, offsetY, blockSize * BOARD_WIDTH, blockSize * BOARD_HEIGHT);

      // Draw Grid Lines
      ctx.strokeStyle = theme.gridLine;
      ctx.lineWidth = 1;
      for (let c = 0; c <= BOARD_WIDTH; c++) {
        ctx.beginPath();
        ctx.moveTo(offsetX + c * blockSize, offsetY);
        ctx.lineTo(offsetX + c * blockSize, offsetY + BOARD_HEIGHT * blockSize);
        ctx.stroke();
      }
      for (let r = 0; r <= BOARD_HEIGHT; r++) {
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY + r * blockSize);
        ctx.lineTo(offsetX + BOARD_WIDTH * blockSize, offsetY + r * blockSize);
        ctx.stroke();
      }

      // Draw Locked Grid Cells
      for (let r = BUFFER_HEIGHT; r < core.grid.length; r++) {
        const boardY = r - BUFFER_HEIGHT;
        for (let c = 0; c < BOARD_WIDTH; c++) {
          const cell = core.grid[r][c];
          if (cell) {
            const cellColor = theme.colors[cell.type] || cell.color;
            drawBlock(ctx, offsetX + c * blockSize, offsetY + boardY * blockSize, blockSize, cellColor, cell.special, seniorMode);
          }
        }
      }

      // Draw Ghost Piece
      if (core.activePiece && !core.isGameOver) {
        const ghostY = core.getGhostY();
        const matrix = core.activePiece.type ? getMatrix(core.activePiece.type, core.activePiece.rotation) : [];
        const ghostColor = theme.colors[core.activePiece.type];

        ctx.save();
        ctx.globalAlpha = theme.ghostAlpha;
        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== 0) {
              const targetY = (ghostY + r) - BUFFER_HEIGHT;
              const targetX = core.activePiece.x + c;
              if (targetY >= 0 && targetY < BOARD_HEIGHT) {
                drawGhostBlock(ctx, offsetX + targetX * blockSize, offsetY + targetY * blockSize, blockSize, ghostColor);
              }
            }
          }
        }
        ctx.restore();
      }

      // Draw Active Piece
      if (core.activePiece && !core.isGameOver) {
        const matrix = getMatrix(core.activePiece.type, core.activePiece.rotation);
        const pieceColor = theme.colors[core.activePiece.type];

        for (let r = 0; r < matrix.length; r++) {
          for (let c = 0; c < matrix[r].length; c++) {
            if (matrix[r][c] !== 0) {
              const targetY = (core.activePiece.y + r) - BUFFER_HEIGHT;
              const targetX = core.activePiece.x + c;
              if (targetY >= 0 && targetY < BOARD_HEIGHT) {
                drawBlock(ctx, offsetX + targetX * blockSize, offsetY + targetY * blockSize, blockSize, pieceColor, core.activePiece.special, seniorMode);
              }
            }
          }
        }
      }

      // Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += (p.vx / blockSize);
        p.y += (p.vy / blockSize);
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(offsetX + p.x * blockSize, offsetY + p.y * blockSize, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Floating Text Announcements
      for (let i = floatersRef.current.length - 1; i >= 0; i--) {
        const f = floatersRef.current[i];
        f.y += f.vy;
        f.alpha -= 0.02;

        if (f.alpha <= 0) {
          floatersRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, f.alpha);
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.fillText(f.text, offsetX + f.x * blockSize, offsetY + f.y * blockSize);
        ctx.restore();
      }

      // Outer Border Glow
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX, offsetY, blockSize * BOARD_WIDTH, blockSize * BOARD_HEIGHT);

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [core, themeId, seniorMode]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[420px] max-h-[840px] touch-none rounded-xl"
      />
    </div>
  );
};

// Helper: Get matrix for a given rotation
function getMatrix(type: TetrominoType, rot: number): number[][] {
  return TETROMINOES[type].matrix[rot];
}

// Draw block with modern bevel, glow, and accessible tactile glyph
function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  special: string,
  seniorMode: boolean
) {
  const padding = seniorMode ? 1 : 1.5;
  const bX = x + padding;
  const bY = y + padding;
  const bSize = size - padding * 2;
  const radius = seniorMode ? 6 : 4;

  // Base Fill
  ctx.save();
  ctx.fillStyle = color;
  roundedRect(ctx, bX, bY, bSize, bSize, radius);
  ctx.fill();

  // Top/Left highlight bevel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.beginPath();
  ctx.moveTo(bX, bY + bSize);
  ctx.lineTo(bX, bY);
  ctx.lineTo(bX + bSize, bY);
  ctx.lineTo(bX + bSize - 3, bY + 3);
  ctx.lineTo(bX + 3, bY + 3);
  ctx.lineTo(bX + 3, bY + bSize - 3);
  ctx.closePath();
  ctx.fill();

  // Bottom/Right shadow bevel
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.moveTo(bX + bSize, bY);
  ctx.lineTo(bX + bSize, bY + bSize);
  ctx.lineTo(bX, bY + bSize);
  ctx.lineTo(bX + 3, bY + bSize - 3);
  ctx.lineTo(bX + bSize - 3, bY + bSize - 3);
  ctx.lineTo(bX + bSize - 3, bY + 3);
  ctx.closePath();
  ctx.fill();

  // Special block indicators
  if (special === 'BOMB') {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(size * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💣', bX + bSize / 2, bY + bSize / 2 + 1);
  } else if (special === 'QUANTUM') {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(size * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚛', bX + bSize / 2, bY + bSize / 2);
  } else if (special === 'FROZEN') {
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(bX + 4, bY + 4, bSize - 8, bSize - 8);
  } else if (special === 'GOLD') {
    ctx.fillStyle = '#fffbeb';
    ctx.font = `bold ${Math.floor(size * 0.5)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', bX + bSize / 2, bY + bSize / 2);
  }

  ctx.restore();
}

function drawGhostBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  const padding = 1.5;
  const bX = x + padding;
  const bY = y + padding;
  const bSize = size - padding * 2;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([2, 2]);
  roundedRect(ctx, bX, bY, bSize, bSize, 4);
  ctx.stroke();
  ctx.setLineDash([]);
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
