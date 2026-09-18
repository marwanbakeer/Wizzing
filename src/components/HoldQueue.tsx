import React from 'react';
import { TETROMINOES, THEMES, type TetrominoType, type SpecialBlockType, type ThemeId } from '../engine/tetrominoes';

interface HoldQueueProps {
  holdPiece: { type: TetrominoType; special: SpecialBlockType } | null;
  canHold: boolean;
  themeId: ThemeId;
}

export const HoldQueue: React.FC<HoldQueueProps> = ({ holdPiece, canHold, themeId }) => {
  const theme = THEMES[themeId];

  return (
    <div className={`glass-panel p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
      canHold ? 'border-wizz-cyan/30' : 'opacity-60 border-slate-700'
    }`}>
      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">HOLD</span>
      <div className="w-16 h-14 flex items-center justify-center relative">
        {holdPiece ? (
          <div className="grid gap-0.5" style={{
            gridTemplateColumns: `repeat(${TETROMINOES[holdPiece.type].matrix[0][0].length}, 1fr)`
          }}>
            {TETROMINOES[holdPiece.type].matrix[0].map((row, r) =>
              row.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-3.5 h-3.5 rounded-sm transition-transform"
                  style={{
                    backgroundColor: val ? (theme.colors[holdPiece.type] || '#00f2fe') : 'transparent',
                    boxShadow: val ? `0 0 6px ${theme.colors[holdPiece.type] || '#00f2fe'}` : 'none'
                  }}
                />
              ))
            )}
          </div>
        ) : (
          <span className="text-slate-600 text-xs font-mono">-</span>
        )}
      </div>
    </div>
  );
};
