export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  targetLines: number;
  targetScore?: number;
  bossHealth?: number;
  speedMs: number;
  hasBombs?: boolean;
  hasQuantum?: boolean;
  hasIce?: boolean;
  hasGlitch?: boolean;
  hasLaserSweeper?: boolean;
  hasSeismicQuake?: boolean;
  accentColor: string;
  badge: string;
}

export const STAGES: StageConfig[] = [
  {
    id: 1,
    name: "Genesis Neon",
    subtitle: "The Pure Foundation",
    description: "Master modern tactile mechanics with fluid SRS rotations and clean ghost guide.",
    targetLines: 10,
    speedMs: 800,
    accentColor: "#00f2fe",
    badge: "ALPHA"
  },
  {
    id: 2,
    name: "Anti-Gravity Vortex",
    subtitle: "Quantum Inversion",
    description: "Quantum glowing blocks appear that reverse gravity on landing and dissolve obstacles.",
    targetLines: 12,
    speedMs: 700,
    hasQuantum: true,
    accentColor: "#a855f7",
    badge: "QUANTUM"
  },
  {
    id: 3,
    name: "Prism Cascade",
    subtitle: "Explosive Combos",
    description: "Gold multiplier blocks trigger massive chain reaction scores.",
    targetLines: 15,
    speedMs: 600,
    hasBombs: true,
    accentColor: "#f59e0b",
    badge: "BURST"
  },
  {
    id: 4,
    name: "Laser Matrix",
    subtitle: "Sweep & Incinerate",
    description: "Every 15 seconds, a high-intensity laser line sweeps through, disintegrating rows.",
    targetLines: 15,
    speedMs: 550,
    hasLaserSweeper: true,
    accentColor: "#f43f5e",
    badge: "BEAM"
  },
  {
    id: 5,
    name: "Glitch Core",
    subtitle: "Shape Mutators",
    description: "Mutating glitch blocks morph shapes unless locked down with lightning precision.",
    targetLines: 18,
    speedMs: 500,
    hasGlitch: true,
    accentColor: "#ec4899",
    badge: "MUTATION"
  },
  {
    id: 6,
    name: "Cryo Frost",
    subtitle: "Sub-Zero Armor",
    description: "Dense frozen ice blocks freeze rows and require double line clears to shatter.",
    targetLines: 20,
    speedMs: 450,
    hasIce: true,
    accentColor: "#38bdf8",
    badge: "PERMAFROST"
  },
  {
    id: 7,
    name: "Hyper Velocity",
    subtitle: "Adrenaline Surge",
    description: "Accelerated gravity tests reflexes with x3 combo multipliers.",
    targetLines: 20,
    speedMs: 320,
    accentColor: "#10b981",
    badge: "VELOCITY"
  },
  {
    id: 8,
    name: "Seismic Quake",
    subtitle: "Rising Mantle",
    description: "Tectonic tremors periodically push up random garbage blocks from below.",
    targetLines: 22,
    speedMs: 300,
    hasSeismicQuake: true,
    accentColor: "#fb923c",
    badge: "TECTONIC"
  },
  {
    id: 9,
    name: "Titan Colossus",
    subtitle: "The Guardian Battle",
    description: "Inflict damage on the Titan Boss with 2-line, 3-line, and 4-line Wizzing clears!",
    targetLines: 25,
    bossHealth: 1500,
    speedMs: 260,
    hasBombs: true,
    accentColor: "#e11d48",
    badge: "BOSS FIGHT"
  },
  {
    id: 10,
    name: "Singularity 2056",
    subtitle: "The 30-Year Transcendence",
    description: "Master all dimensional hazards simultaneously in the ultimate puzzle ascension.",
    targetLines: 30,
    speedMs: 200,
    hasBombs: true,
    hasQuantum: true,
    hasIce: true,
    accentColor: "#c084fc",
    badge: "IMMORTAL"
  }
];
