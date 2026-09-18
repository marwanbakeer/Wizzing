export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type SpecialBlockType = 'NORMAL' | 'BOMB' | 'QUANTUM' | 'FROZEN' | 'GOLD';

export interface CellData {
  type: TetrominoType;
  special: SpecialBlockType;
  color: string;
  hitsNeeded?: number; // for FROZEN blocks
}

export type RotationState = 0 | 1 | 2 | 3;

export interface TetrominoDef {
  type: TetrominoType;
  matrix: number[][][]; // 4 rotations, each NxN matrix (0 or 1)
  color: string;
}

// Canonical 4-rotation definitions in standard bounding boxes
export const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: {
    type: 'I',
    color: '#00f2fe', // Cyan
    matrix: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ]
    ]
  },
  J: {
    type: 'J',
    color: '#3b82f6', // Deep Blue
    matrix: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ]
    ]
  },
  L: {
    type: 'L',
    color: '#f97316', // Vibrant Orange
    matrix: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]
    ]
  },
  O: {
    type: 'O',
    color: '#eab308', // Radiant Amber / Yellow
    matrix: [
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ]
    ]
  },
  S: {
    type: 'S',
    color: '#10b981', // Emerald Green
    matrix: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ]
  },
  T: {
    type: 'T',
    color: '#a855f7', // Electric Purple
    matrix: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ]
  },
  Z: {
    type: 'Z',
    color: '#f43f5e', // Neon Rose / Crimson
    matrix: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
      ]
    ]
  }
};

// SRS (Super Rotation System) Wall-Kick Data
// Offset tests format: [dx, dy] where +dx is right, +dy is up (in grid coords, dy subtracted)
export const JLSTZ_KICKS: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

export const I_KICKS: Record<string, [number, number][]> = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

// Color themes designed for both youth vibrancy and senior accessibility
export type ThemeId = 'cyber-neon' | 'high-contrast' | 'zen-pastel' | 'retro-gameboy';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  colors: Record<TetrominoType, string>;
  bg: string;
  gridLine: string;
  ghostAlpha: number;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Neon 2026',
    description: 'High-energy luminescent glow for next-gen thrill',
    colors: {
      I: '#00f2fe',
      J: '#3b82f6',
      L: '#f97316',
      O: '#eab308',
      S: '#10b981',
      T: '#a855f7',
      Z: '#f43f5e'
    },
    bg: '#0a0d14',
    gridLine: 'rgba(255, 255, 255, 0.05)',
    ghostAlpha: 0.25
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'Obsidian Clarity (Senior / Accessible)',
    description: 'Ultra-crisp distinct colors optimized for all eyesight levels',
    colors: {
      I: '#38bdf8', // Light sky blue
      J: '#2563eb', // Royal blue
      L: '#ea580c', // Bright deep orange
      O: '#facc15', // Pure sunny yellow
      S: '#16a34a', // Clear deep green
      T: '#9333ea', // Vivid purple
      Z: '#dc2626'  // Pure crimson red
    },
    bg: '#000000',
    gridLine: 'rgba(255, 255, 255, 0.15)',
    ghostAlpha: 0.35
  },
  'zen-pastel': {
    id: 'zen-pastel',
    name: 'Zen Pastel',
    description: 'Soft calming meditative hues for relaxed flow sessions',
    colors: {
      I: '#7dd3fc',
      J: '#93c5fd',
      L: '#fdba74',
      O: '#fef08a',
      S: '#86efac',
      T: '#d8b4fe',
      Z: '#fda4af'
    },
    bg: '#0f172a',
    gridLine: 'rgba(255, 255, 255, 0.06)',
    ghostAlpha: 0.2
  },
  'retro-gameboy': {
    id: 'retro-gameboy',
    name: 'Classic 1989 Mono',
    description: 'Nostalgic 4-shade LCD aesthetic paying homage to the origins',
    colors: {
      I: '#9bbc0f',
      J: '#8bac0f',
      L: '#8bac0f',
      O: '#9bbc0f',
      S: '#306230',
      T: '#306230',
      Z: '#0f380f'
    },
    bg: '#1b2c1b',
    gridLine: 'rgba(155, 188, 15, 0.12)',
    ghostAlpha: 0.25
  }
};
