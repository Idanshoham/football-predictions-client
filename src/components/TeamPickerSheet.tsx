import { useState, useEffect } from 'react';
import type { Team } from '../types';

interface Props {
  open: boolean;
  title: string;
  teams: Team[];
  selectedId?: string | null;
  onPick: (team: Team) => void;
  onClose: () => void;
}

export function TeamPickerSheet({ open, title, teams, selectedId, onPick, onClose }: Props) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  if (!open) return null;

  const filtered = query
    ? teams.filter((t) => t.nameHe.includes(query))
    : teams;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        aria-label="סגור"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[80vh] bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-sm text-slate-200">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
            aria-label="סגור"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-2 border-b border-slate-800">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש קבוצה..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:border-slate-600"
            autoFocus
          />
        </div>
        <ul className="overflow-y-auto flex-1 divide-y divide-slate-800">
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-slate-500 text-sm">
              לא נמצאו תוצאות
            </li>
          )}
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  onPick(t);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-start hover:bg-slate-800 transition ${
                  t.id === selectedId ? 'bg-emerald-900/30' : ''
                }`}
              >
                <span className="text-2xl">{t.flagEmoji}</span>
                <span className="flex-1 font-medium">{t.nameHe}</span>
                {t.id === selectedId && (
                  <span className="text-emerald-400 text-lg">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
