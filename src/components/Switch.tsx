import React from 'react';

interface SwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ enabled, onChange, label }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        enabled ? 'bg-ax-accent' : 'bg-slate-700'
      }`}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      {label && (
        <span className="absolute left-14 text-xs text-ax-muted whitespace-nowrap">
          {label}
        </span>
      )}
    </button>
  );
};