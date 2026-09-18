import React from 'react';
import { STAGES, type StageConfig } from '../engine/stages';
import { Lock, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface StageSelectModalProps {
  unlockedStageId: number;
  currentStageId: number;
  onSelectStage: (stage: StageConfig) => void;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  unlockedStageId,
  currentStageId,
  onSelectStage,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md max-h-[85vh] glass-panel rounded-3xl p-5 flex flex-col gap-4 border border-cyan-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>DIMENSIONAL ODYSSEY</span>
            </h2>
            <p className="text-xs text-slate-400">Select a stage to explore the quantum continuum</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stages List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
          {STAGES.map((stage) => {
            const isUnlocked = stage.id <= unlockedStageId;
            const isCurrent = stage.id === currentStageId;
            const isCompleted = stage.id < unlockedStageId;

            return (
              <button
                key={stage.id}
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectStage(stage);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20'
                    : isUnlocked
                    ? 'bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80'
                    : 'bg-slate-950/50 opacity-40 border border-slate-800 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isUnlocked ? 'text-white' : 'text-slate-600 bg-slate-900'
                    }`}
                    style={{
                      backgroundColor: isUnlocked ? stage.accentColor + '33' : undefined,
                      border: isUnlocked ? `1px solid ${stage.accentColor}` : undefined
                    }}
                  >
                    {isUnlocked ? (
                      isCompleted ? <CheckCircle2 size={18} className="text-emerald-400" /> : stage.id
                    ) : (
                      <Lock size={16} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {stage.name}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase"
                        style={{
                          backgroundColor: stage.accentColor + '22',
                          color: stage.accentColor
                        }}
                      >
                        {stage.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {stage.subtitle} • Target: {stage.targetLines} Lines
                    </p>
                  </div>
                </div>

                {isUnlocked && (
                  <ChevronRight size={18} className="text-slate-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
