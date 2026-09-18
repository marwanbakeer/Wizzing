import React from 'react';
import { TETROMINOES, THEMES, type TetrominoType, type SpecialBlockType, type ThemeId } from '../engine/tetrominoes';

interface NextQueueProps {
  queue: { type: TetrominoType; special: SpecialBlockType }[];
  themeId: ThemeId;
}

export const NextQueue: React.FC<NextQueueProps> = ({ queue, themeId }) => {
  const theme = THEMES[themeId];
  const items = queue.slice(0, 3);

  return (
    <div className="glass-panel p-2.5 rounded-2xl flex flex-col items-center justify-center gap-2 border-slate-700/60">
      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">NEXT</span>
      <div className="flex flex-col gap-2.5 items-center justify-center">
        {items.map((item, idx) => {
          const matrix = TETROMINOES[item.type].matrix[0];
          const color = theme.colors[item.type] || '#00f2fe';
          const scale = idx === 0 ? 'scale-100' : 'scale-90 opacity-75';

          return (
            <div key={idx} className={`w-14 h-10 flex items-center justify-center transition-all ${scale}`}>
              <div
                className="grid gap-0.5"
                style={{
                  gridTemplateColumns: `repeat(${matrix[0].length}, 1fr)`
                }}
              >
                {matrix.map((row, r) =>
                  row.map((val, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: val ? color : 'transparent',
                        boxShadow: val ? `0 0 5px ${color}` : 'none'
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
