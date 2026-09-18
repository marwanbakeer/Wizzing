import React from 'react';
import type { GameStats } from '../engine/tetrisCore';
import type { StageConfig } from '../engine/stages';
import { Volume2, VolumeX, Pause, Play, Settings, MapPin, Zap } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  stage: StageConfig | null;
  highScore: number;
  isPaused: boolean;
  isMuted: boolean;
  seniorMode: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenStages: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  stage,
  highScore,
  isPaused,
  isMuted,
  seniorMode,
  onTogglePause,
  onToggleMute,
  onOpenSettings,
  onOpenStages
}) => {
  const lineProgress = stage ? Math.min(100, Math.round((stats.lines / stage.targetLines) * 100)) : 0;
  const bossProgress = stage?.bossHealth && stats.bossHpRemaining !== undefined
    ? Math.max(0, Math.round((stats.bossHpRemaining / stage.bossHealth) * 100))
    : null;

  return (
    <div className="w-full max-w-[440px] px-3 pt-2 pb-1 flex flex-col gap-1.5 select-none">
      {/* Top Bar: Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-cyan-500/30">
            W
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-black tracking-tight ${seniorMode ? 'text-lg text-yellow-300' : 'text-base text-white'}`}>
                WIZZING
              </span>
              {stage && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-wider">
                  {stage.badge}
                </span>
              )}
            </div>
            {stage && (
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                S{stage.id}: {stage.name}
              </p>
            )}
          </div>
        </div>

        {/* Buttons: Stage Map, Audio, Pause, Settings */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenStages}
            title="Stage Select"
            className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-cyan-400 active:scale-95 transition-all"
          >
            <MapPin size={15} />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-cyan-400 active:scale-95 transition-all"
          >
            {isMuted ? <VolumeX size={15} className="text-red-400" /> : <Volume2 size={15} />}
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? "Resume" : "Pause"}
            className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-amber-400 active:scale-95 transition-all"
          >
            {isPaused ? <Play size={15} className="text-amber-400 fill-amber-400" /> : <Pause size={15} />}
          </button>

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="w-8 h-8 rounded-xl glass-panel flex items-center justify-center text-slate-300 hover:text-purple-400 active:scale-95 transition-all"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Primary Stats: Score & High Score */}
      <div className="grid grid-cols-3 gap-2 mt-0.5">
        <div className="glass-panel px-2.5 py-1.5 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SCORE</span>
          <span className={`font-mono font-bold leading-tight ${seniorMode ? 'text-xl text-cyan-300' : 'text-base text-white'}`}>
            {stats.score.toLocaleString()}
          </span>
        </div>

        <div className="glass-panel px-2.5 py-1.5 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LINES</span>
          <div className="flex items-baseline gap-1">
            <span className={`font-mono font-bold leading-tight ${seniorMode ? 'text-xl text-white' : 'text-base text-white'}`}>
              {stats.lines}
            </span>
            {stage && (
              <span className="text-[11px] text-slate-400 font-mono">
                / {stage.targetLines}
              </span>
            )}
          </div>
        </div>

        <div className="glass-panel px-2.5 py-1.5 rounded-xl flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BEST</span>
          <span className={`font-mono font-bold leading-tight text-amber-400 ${seniorMode ? 'text-lg' : 'text-base'}`}>
            {Math.max(highScore, stats.score).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Stage Goal Progress Bar */}
      {stage && (
        <div className="w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${lineProgress}%` }}
          />
        </div>
      )}

      {/* Boss Health Bar (if active) */}
      {bossProgress !== null && (
        <div className="glass-panel p-2 rounded-xl flex flex-col gap-1 border-rose-500/40">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-rose-400 flex items-center gap-1">
              <Zap size={11} className="fill-rose-400" /> TITAN COLOSSUS HP
            </span>
            <span className="text-white font-mono">{stats.bossHpRemaining} / {stage?.bossHealth}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-rose-900/60">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-orange-500 transition-all duration-200"
              style={{ width: `${bossProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
