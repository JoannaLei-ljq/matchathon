'use client';

import { useCallback, useState } from 'react';
import type { Hackathon } from './types';

const KEY = 'matchathon.hackathon';

function read(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/**
 * Which of the user's hackathons the match and team pages are looking at.
 * Remembered per browser; falls back to the soonest one the user has joined.
 */
export function useSelectedHackathon(joined: Hackathon[]) {
  const [chosenId, setChosenId] = useState<string | null>(read);

  const sorted = [...joined].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const selected = sorted.find((h) => h._id === chosenId) ?? sorted[0] ?? null;

  const select = useCallback((id: string) => {
    setChosenId(id);
    try {
      localStorage.setItem(KEY, id);
    } catch {
      // Not remembered across reloads; fine.
    }
  }, []);

  return { selected, select, options: sorted };
}
