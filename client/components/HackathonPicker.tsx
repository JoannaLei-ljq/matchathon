'use client';

import { ChevronDown } from 'lucide-react';
import type { Hackathon } from '@/lib/types';
import { Pixel } from './Pixel';

export function HackathonPicker({
  options,
  selected,
  onSelect,
}: {
  options: Hackathon[];
  selected: Hackathon | null;
  onSelect: (id: string) => void;
}) {
  const box = 'inline-flex items-center gap-2 border-2 border-mocha bg-foam-light py-1.5 text-sm font-bold shadow-[2px_2px_0_0_var(--color-matcha-dark)]';
  if (options.length <= 1) {
    return selected ? (
      <span className={`${box} px-3`}>
        <Pixel sprite="calendar" scale={1.5} /> {selected.name}
      </span>
    ) : null;
  }
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Hackathon</span>
      <Pixel sprite="calendar" scale={1.5} className="pointer-events-none absolute left-3" />
      <select value={selected?._id} onChange={(e) => onSelect(e.target.value)} className={`${box} appearance-none pl-9 pr-9`}>
        {options.map((h) => (
          <option key={h._id} value={h._id}>
            {h.name}
          </option>
        ))}
      </select>
      <ChevronDown size={16} strokeWidth={3} className="pointer-events-none absolute right-3" aria-hidden="true" />
    </label>
  );
}
