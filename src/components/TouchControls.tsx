import React, { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RotateCw,
  RotateCcw,
  Zap,
  Bookmark
} from 'lucide-react';
import { haptics } from '../engine/haptics';
import { audioEngine } from '../engine/audioEngine';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onHold: () => void;
  controlMode: 'buttons' | 'gestures' | 'hybrid';
  handedness: 'right' | 'left';
  seniorMode: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotateCW,
  onRotateCCW,
  onHold,
  controlMode,
  handedness,
  seniorMode
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Gestures Handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (controlMode === 'buttons') return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (controlMode === 'buttons' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    touchStartRef.current = null;

    // Fast flick down: Hard drop
    if (dy > 60 && absY > absX * 1.5 && dt < 280) {
      haptics.impactHeavy();
      audioEngine.playDrop();
      onHardDrop();
      return;
    }

    // Swipe up: Hold
    if (dy < -50 && absY > absX * 1.5) {
      haptics.impactMedium();
      audioEngine.playHold();
      onHold();
      return;
    }

    // Horizontal swipes
    if (absX > 35 && absX > absY) {
      if (dx > 0) {
        haptics.impactLight();
        audioEngine.playMove();
        onMoveRight();
      } else {
        haptics.impactLight();
        audioEngine.playMove();
        onMoveLeft();
      }
      return;
    }

    // Tap in place: Rotate CW
    if (absX < 20 && absY < 20 && dt < 250) {
      haptics.impactLight();
      audioEngine.playRotate();
      onRotateCW();
    }
  };

  const btnBaseClass = `touch-btn rounded-2xl flex items-center justify-center font-bold select-none active:scale-90 transition-all ${
    seniorMode ? 'p-4 text-xl' : 'p-3 text-base'
  }`;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full max-w-[440px] px-2 pb-safe pt-1 flex flex-col gap-2 select-none"
    >
      {/* On-screen tactile buttons */}
      <div className={`w-full flex items-center justify-between gap-3 ${
        handedness === 'left' ? 'flex-row-reverse' : ''
      }`}>
        {/* Directional Thumb Cluster */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactLight();
              audioEngine.playMove();
              onMoveLeft();
            }}
            className={`${btnBaseClass} w-13 h-13 glass-panel-glow text-cyan-400`}
            aria-label="Move Left"
          >
            <ArrowLeft size={seniorMode ? 26 : 22} />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactMedium();
              audioEngine.playMove();
              onSoftDrop();
            }}
            className={`${btnBaseClass} w-13 h-13 glass-panel-glow text-cyan-400`}
            aria-label="Soft Drop"
          >
            <ArrowDown size={seniorMode ? 26 : 22} />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactLight();
              audioEngine.playMove();
              onMoveRight();
            }}
            className={`${btnBaseClass} w-13 h-13 glass-panel-glow text-cyan-400`}
            aria-label="Move Right"
          >
            <ArrowRight size={seniorMode ? 26 : 22} />
          </button>
        </div>

        {/* Action Cluster: Rotate, Hard Drop, Hold */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactMedium();
              audioEngine.playHold();
              onHold();
            }}
            className={`${btnBaseClass} w-12 h-12 glass-panel text-slate-300 hover:text-cyan-400`}
            aria-label="Hold Piece"
            title="Hold"
          >
            <Bookmark size={seniorMode ? 22 : 18} />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactLight();
              audioEngine.playRotate();
              onRotateCCW();
            }}
            className={`${btnBaseClass} w-12 h-12 glass-panel text-purple-400`}
            aria-label="Rotate Counter-Clockwise"
          >
            <RotateCcw size={seniorMode ? 22 : 18} />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactLight();
              audioEngine.playRotate();
              onRotateCW();
            }}
            className={`${btnBaseClass} w-13 h-13 glass-panel-glow text-purple-300 shadow-purple-500/30`}
            aria-label="Rotate Clockwise"
          >
            <RotateCw size={seniorMode ? 26 : 22} />
          </button>

          <button
            onPointerDown={(e) => {
              e.preventDefault();
              haptics.impactHeavy();
              audioEngine.playDrop();
              onHardDrop();
            }}
            className={`${btnBaseClass} w-13 h-13 bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/40`}
            aria-label="Hard Drop"
            title="Slam Drop"
          >
            <Zap size={seniorMode ? 26 : 22} className="fill-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
