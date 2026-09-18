import React from 'react';
import { THEMES, type ThemeId } from '../engine/tetrominoes';
import { X, Volume2, Sparkles, Smartphone, Eye, Sliders } from 'lucide-react';

interface SettingsModalProps {
  themeId: ThemeId;
  seniorMode: boolean;
  screenShake: boolean;
  musicVol: number;
  sfxVol: number;
  hapticsEnabled: boolean;
  handedness: 'right' | 'left';
  controlMode: 'buttons' | 'gestures' | 'hybrid';
  onThemeChange: (theme: ThemeId) => void;
  onToggleSeniorMode: (val: boolean) => void;
  onToggleScreenShake: (val: boolean) => void;
  onMusicVolChange: (val: number) => void;
  onSfxVolChange: (val: number) => void;
  onToggleHaptics: (val: boolean) => void;
  onHandednessChange: (val: 'right' | 'left') => void;
  onControlModeChange: (val: 'buttons' | 'gestures' | 'hybrid') => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  themeId,
  seniorMode,
  screenShake,
  musicVol,
  sfxVol,
  hapticsEnabled,
  handedness,
  controlMode,
  onThemeChange,
  onToggleSeniorMode,
  onToggleScreenShake,
  onMusicVolChange,
  onSfxVolChange,
  onToggleHaptics,
  onHandednessChange,
  onControlModeChange,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md max-h-[88vh] glass-panel rounded-3xl p-5 flex flex-col gap-4 border border-purple-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-purple-400" />
            <h2 className="text-lg font-black text-white tracking-tight">SETTINGS & ACCESSIBILITY</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-xs">
          {/* Senior & Accessibility Mode Toggle */}
          <div className="glass-panel p-3.5 rounded-2xl border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-950/80 text-cyan-400 flex items-center justify-center">
                <Eye size={18} />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Senior / High Visibility Mode</p>
                <p className="text-[11px] text-slate-400">Larger fonts, bold contrasts, relaxed pacing</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={seniorMode}
              onChange={(e) => onToggleSeniorMode(e.target.checked)}
              className="w-5 h-5 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Theme Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" /> Color Aesthetics & Themes
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
                const item = THEMES[tId];
                const active = themeId === tId;
                return (
                  <button
                    key={tId}
                    onClick={() => onThemeChange(tId)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      active
                        ? 'bg-purple-950/60 border-purple-400 shadow-md shadow-purple-500/20'
                        : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] truncate">{item.name}</span>
                      <div className="flex gap-0.5">
                        {['I', 'O', 'T'].map((k) => (
                          <div
                            key={k}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.colors[k as keyof typeof item.colors] }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 line-clamp-1">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Controls */}
          <div className="glass-panel p-3.5 rounded-2xl flex flex-col gap-3">
            <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 size={13} className="text-cyan-400" /> Synthesized Audio & Effects
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Procedural Music</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVol}
                  onChange={(e) => onMusicVolChange(parseFloat(e.target.value))}
                  className="w-36 accent-cyan-400"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Tactile SFX</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={sfxVol}
                  onChange={(e) => onSfxVolChange(parseFloat(e.target.value))}
                  className="w-36 accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Controls & Feedback */}
          <div className="glass-panel p-3.5 rounded-2xl flex flex-col gap-3">
            <label className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone size={13} className="text-emerald-400" /> Mobile Touch & Haptics
            </label>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Haptic Vibration</span>
                <input
                  type="checkbox"
                  checked={hapticsEnabled}
                  onChange={(e) => onToggleHaptics(e.target.checked)}
                  className="w-4 h-4 accent-emerald-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Screen Shake Effects</span>
                <input
                  type="checkbox"
                  checked={screenShake}
                  onChange={(e) => onToggleScreenShake(e.target.checked)}
                  className="w-4 h-4 accent-emerald-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Control Layout</span>
                <div className="flex gap-1">
                  {(['right', 'left'] as const).map((hand) => (
                    <button
                      key={hand}
                      onClick={() => onHandednessChange(hand)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        handedness === hand
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {hand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Input Mode</span>
                <div className="flex gap-1">
                  {(['hybrid', 'buttons', 'gestures'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onControlModeChange(mode)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        controlMode === mode
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
