import { useState, useEffect, useMemo } from 'react';
import { TetrisCore, type GameStats } from './engine/tetrisCore';
import { STAGES, type StageConfig } from './engine/stages';
import type { ThemeId } from './engine/tetrominoes';
import { audioEngine } from './engine/audioEngine';
import { haptics } from './engine/haptics';

import { GameBoard } from './components/GameBoard';
import { HoldQueue } from './components/HoldQueue';
import { NextQueue } from './components/NextQueue';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { StageSelectModal } from './components/StageSelectModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';

export function App() {
  // Core Engine Instance
  const core = useMemo(() => new TetrisCore(), []);

  // Persistent Settings & Progress
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    return (localStorage.getItem('wizzing_theme') as ThemeId) || 'cyber-neon';
  });
  const [seniorMode, setSeniorMode] = useState<boolean>(() => {
    return localStorage.getItem('wizzing_senior') === 'true';
  });
  const [screenShake, setScreenShake] = useState<boolean>(true);
  const [unlockedStageId, setUnlockedStageId] = useState<number>(() => {
    return parseInt(localStorage.getItem('wizzing_unlocked') || '1', 10);
  });
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('wizzing_highscore') || '0', 10);
  });

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [musicVol, setMusicVol] = useState<number>(0.4);
  const [sfxVol, setSfxVol] = useState<number>(0.6);

  // Control Preferences
  const [handedness, setHandedness] = useState<'right' | 'left'>('right');
  const [controlMode, setControlMode] = useState<'hybrid' | 'buttons' | 'gestures'>('hybrid');

  // UI Flow Modals
  const [currentStage, setCurrentStage] = useState<StageConfig>(STAGES[0]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showStageSelect, setShowStageSelect] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Reactive Stats mirrored from core for UI
  const [stats, setStats] = useState<GameStats>(core.stats);
  const [holdPiece, setHoldPiece] = useState(core.holdPiece);
  const [canHold, setCanHold] = useState(core.canHold);
  const [nextQueue, setNextQueue] = useState(core.nextQueue);

  // Sync state helper
  const syncState = () => {
    setStats({ ...core.stats });
    setHoldPiece(core.holdPiece ? { ...core.holdPiece } : null);
    setCanHold(core.canHold);
    setNextQueue([...core.nextQueue]);
  };

  // Initialize Game Stage
  const startStage = (stage: StageConfig, preserveScore: boolean = false) => {
    const scoreToKeep = preserveScore ? core.stats.score : 0;
    core.initStage(stage, scoreToKeep);
    setCurrentStage(stage);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    syncState();
    audioEngine.startMusic();
  };

  // Initial Load
  useEffect(() => {
    startStage(STAGES[0]);

    core.onGameOverCallback = () => {
      audioEngine.playGameOver();
      haptics.notificationWarning();
      setIsGameOver(true);
      setIsVictory(false);
      syncState();
    };

    core.onStageCompleteCallback = (finalStats) => {
      audioEngine.playWizzFanfare();
      haptics.notificationSuccess();
      setIsVictory(true);
      setIsGameOver(false);

      // Unlock next stage
      const nextId = currentStage.id + 1;
      if (nextId <= STAGES.length && nextId > unlockedStageId) {
        setUnlockedStageId(nextId);
        localStorage.setItem('wizzing_unlocked', nextId.toString());
      }

      // Update High Score
      if (finalStats.score > highScore) {
        setHighScore(finalStats.score);
        localStorage.setItem('wizzing_highscore', finalStats.score.toString());
      }
      syncState();
    };

    core.onClearCallback = (evt) => {
      if (evt.isWizz) {
        audioEngine.playWizzFanfare();
        haptics.notificationSuccess();
      } else {
        audioEngine.playLineClear(evt.lines);
        haptics.impactMedium();
      }
      syncState();
    };
  }, [core]);

  // High score tracking
  useEffect(() => {
    if (stats.score > highScore) {
      setHighScore(stats.score);
      localStorage.setItem('wizzing_highscore', stats.score.toString());
    }
  }, [stats.score, highScore]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showStageSelect) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (core.moveLeft()) {
            audioEngine.playMove();
            haptics.impactLight();
            syncState();
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (core.moveRight()) {
            audioEngine.playMove();
            haptics.impactLight();
            syncState();
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (core.softDrop()) {
            audioEngine.playMove();
            haptics.impactLight();
            syncState();
          }
          break;
        case ' ': // Space: Hard Drop
          e.preventDefault();
          core.hardDrop();
          audioEngine.playDrop();
          haptics.impactHeavy();
          syncState();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'x':
        case 'X':
          if (core.rotate(true)) {
            audioEngine.playRotate();
            haptics.impactLight();
            syncState();
          }
          break;
        case 'z':
        case 'Z':
        case 'Control':
          if (core.rotate(false)) {
            audioEngine.playRotate();
            haptics.impactLight();
            syncState();
          }
          break;
        case 'c':
        case 'C':
        case 'Shift':
          if (core.hold()) {
            audioEngine.playHold();
            haptics.impactMedium();
            syncState();
          }
          break;
        case 'p':
        case 'P':
        case 'Escape':
          togglePause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [core, isPaused, showSettings, showStageSelect]);

  // Audio settings sync
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMuted(next);
  };

  const handleMusicVol = (v: number) => {
    setMusicVol(v);
    audioEngine.setMusicVolume(v);
  };

  const handleSfxVol = (v: number) => {
    setSfxVol(v);
    audioEngine.setSfxVolume(v);
  };

  const togglePause = () => {
    const next = !isPaused;
    setIsPaused(next);
    core.isPaused = next;
    if (next) {
      audioEngine.stopMusic();
    } else {
      audioEngine.startMusic();
    }
  };

  const handleThemeChange = (t: ThemeId) => {
    setThemeId(t);
    localStorage.setItem('wizzing_theme', t);
  };

  const handleToggleSenior = (val: boolean) => {
    setSeniorMode(val);
    localStorage.setItem('wizzing_senior', val ? 'true' : 'false');
  };

  // Controller Actions for Touch Pad
  const doMoveLeft = () => {
    if (core.moveLeft()) syncState();
  };
  const doMoveRight = () => {
    if (core.moveRight()) syncState();
  };
  const doSoftDrop = () => {
    if (core.softDrop()) syncState();
  };
  const doHardDrop = () => {
    core.hardDrop();
    syncState();
  };
  const doRotateCW = () => {
    if (core.rotate(true)) syncState();
  };
  const doRotateCCW = () => {
    if (core.rotate(false)) syncState();
  };
  const doHold = () => {
    if (core.hold()) syncState();
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-wizz-darker flex flex-col items-center justify-between overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${currentStage.accentColor}44 0%, transparent 70%)`
        }}
      />

      {/* Top HUD Component */}
      <HUD
        stats={stats}
        stage={currentStage}
        highScore={highScore}
        isPaused={isPaused}
        isMuted={isMuted}
        seniorMode={seniorMode}
        onTogglePause={togglePause}
        onToggleMute={toggleMute}
        onOpenSettings={() => setShowSettings(true)}
        onOpenStages={() => setShowStageSelect(true)}
      />

      {/* Main Playfield & Queues */}
      <div className="flex-1 w-full max-w-[440px] px-2 flex items-center justify-center gap-2 overflow-hidden relative">
        {/* Left Side: Hold Queue */}
        <div className="w-16 flex flex-col justify-start self-start pt-2">
          <HoldQueue holdPiece={holdPiece} canHold={canHold} themeId={themeId} />
        </div>

        {/* Center: Canvas Board */}
        <div className="flex-1 h-full max-h-[58vh] flex items-center justify-center relative">
          <GameBoard
            core={core}
            themeId={themeId}
            screenShakeEnabled={screenShake}
            seniorMode={seniorMode}
          />

          {/* Paused Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
              <h3 className="text-2xl font-black text-cyan-400 tracking-wider">PAUSED</h3>
              <button
                onClick={togglePause}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-white shadow-lg active:scale-95 transition-all"
              >
                RESUME
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Next Queue */}
        <div className="w-16 flex flex-col justify-start self-start pt-2">
          <NextQueue queue={nextQueue} themeId={themeId} />
        </div>
      </div>

      {/* Bottom Virtual Ergonomic Touchpad */}
      <TouchControls
        onMoveLeft={doMoveLeft}
        onMoveRight={doMoveRight}
        onSoftDrop={doSoftDrop}
        onHardDrop={doHardDrop}
        onRotateCW={doRotateCW}
        onRotateCCW={doRotateCCW}
        onHold={doHold}
        controlMode={controlMode}
        handedness={handedness}
        seniorMode={seniorMode}
      />

      {/* Modals */}
      {showStageSelect && (
        <StageSelectModal
          unlockedStageId={unlockedStageId}
          currentStageId={currentStage.id}
          onSelectStage={(st) => startStage(st)}
          onClose={() => setShowStageSelect(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          themeId={themeId}
          seniorMode={seniorMode}
          screenShake={screenShake}
          musicVol={musicVol}
          sfxVol={sfxVol}
          hapticsEnabled={haptics.isEnabled()}
          handedness={handedness}
          controlMode={controlMode}
          onThemeChange={handleThemeChange}
          onToggleSeniorMode={handleToggleSenior}
          onToggleScreenShake={setScreenShake}
          onMusicVolChange={handleMusicVol}
          onSfxVolChange={handleSfxVol}
          onToggleHaptics={(v) => haptics.setEnabled(v)}
          onHandednessChange={setHandedness}
          onControlModeChange={setControlMode}
          onClose={() => setShowSettings(false)}
        />
      )}

      {(isGameOver || isVictory) && (
        <GameOverModal
          isVictory={isVictory}
          stats={stats}
          stage={currentStage}
          onRestart={() => startStage(currentStage)}
          onNextStage={
            currentStage.id < STAGES.length
              ? () => startStage(STAGES[currentStage.id])
              : undefined
          }
        />
      )}
    </div>
  );
}

export default App;
