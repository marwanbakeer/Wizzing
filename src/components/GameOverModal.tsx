import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { GameStats } from '../engine/tetrisCore';
import type { StageConfig } from '../engine/stages';
import { Trophy, RefreshCw, ChevronRight, Zap, Target, Award } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  stats: GameStats;
  stage: StageConfig | null;
  onRestart: () => void;
  onNextStage?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  stats,
  stage,
  onRestart,
  onNextStage
}) => {
  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className={`w-full max-w-sm glass-panel rounded-3xl p-6 flex flex-col items-center gap-4 text-center border shadow-2xl ${
        isVictory ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-rose-500/50 shadow-rose-500/20'
      }`}>
        {/* Animated Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
          isVictory
            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/30'
            : 'bg-rose-950/80 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/30'
        }`}>
          {isVictory ? <Trophy size={32} /> : <Zap size={32} />}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isVictory ? 'STAGE CONQUERED!' : 'QUANTUM OVERLOAD'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isVictory
              ? `Dimensions aligned in Stage ${stage?.id}: ${stage?.name}`
              : 'Grid capacity exceeded. Recalibrate and try again.'}
          </p>
        </div>

        {/* Score & Stats Card */}
        <div className="w-full glass-panel rounded-2xl p-4 flex flex-col gap-2.5 border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Award size={13} className="text-amber-400" /> Final Score
            </span>
            <span className="font-mono font-bold text-base text-white">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Target size={13} className="text-cyan-400" /> Lines Cleared
            </span>
            <span className="font-mono font-bold text-white">
              {stats.lines}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap size={13} className="text-purple-400" /> Wizz Quads (4-Lines)
            </span>
            <span className="font-mono font-bold text-purple-300">
              {stats.wizzCount}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Max Combo Chain</span>
            <span className="font-mono font-bold text-emerald-400">
              x{Math.max(0, stats.maxCombo + 1)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2 mt-1">
          {isVictory && onNextStage && (
            <button
              onClick={onNextStage}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
            >
              <span>NEXT DIMENSION</span>
              <ChevronRight size={18} />
            </button>
          )}

          <button
            onClick={onRestart}
            className={`w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
              isVictory
                ? 'glass-panel text-slate-300 hover:text-white'
                : 'bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-rose-500/30'
            }`}
          >
            <RefreshCw size={16} />
            <span>{isVictory ? 'REPLAY STAGE' : 'TRY AGAIN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
