
import React from 'react';
import type { PostProcessingSettings, Translation } from './types';

interface PostProcessingPanelProps {
  settings: PostProcessingSettings;
  setSettings: React.Dispatch<React.SetStateAction<PostProcessingSettings>>;
  t: Translation['postProcessing'];
}

const Slider: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; }> =
  ({ label, value, onChange, min = -100, max = 100, step = 1 }) => (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 text-right">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-8 text-center">{value}</span>
    </div>
);

export const PostProcessingPanel: React.FC<PostProcessingPanelProps> = ({ settings, setSettings, t }) => {
  const updateSetting = <K extends keyof PostProcessingSettings>(key: K, value: PostProcessingSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setSettings({
        temperature: 0,
        exposure: 0,
        contrast: 0,
        highlights: 0,
        shadows: 0,
        saturation: 0,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t.title}</h3>
        <button onClick={resetAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">{t.resetButton}</button>
      </div>
      <Slider label={t.temperature} value={settings.temperature} onChange={v => updateSetting('temperature', v)} />
      <Slider label={t.exposure} value={settings.exposure} onChange={v => updateSetting('exposure', v)} />
      <Slider label={t.contrast} value={settings.contrast} onChange={v => updateSetting('contrast', v)} />
      <Slider label={t.highlights} value={settings.highlights} onChange={v => updateSetting('highlights', v)} />
      <Slider label={t.shadows} value={settings.shadows} onChange={v => updateSetting('shadows', v)} />
      <Slider label={t.saturation} value={settings.saturation} onChange={v => updateSetting('saturation', v)} />
    </div>
  );
};
