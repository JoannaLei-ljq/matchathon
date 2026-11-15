'use client';

import { useId, useState } from 'react';
import { X } from 'lucide-react';

/** Type a tag and press Enter or comma to add it. Click a suggestion to add it too. */
export function TagInput({
  label,
  value,
  onChange,
  suggestions = [],
  placeholder,
  tone = 'matcha',
}: {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  tone?: 'matcha' | 'lemon';
}) {
  const id = useId();
  const [draft, setDraft] = useState('');
  const has = (tag: string) => value.some((t) => t.toLowerCase() === tag.toLowerCase());

  function add(raw: string) {
    const tag = raw.trim().replace(/\s+/g, ' ');
    if (tag && !has(tag) && value.length < 20) onChange([...value, tag]);
    setDraft('');
  }

  const chip = tone === 'matcha' ? 'bg-matcha-soft text-matcha-dark' : 'bg-lemon text-mocha';
  const unused = suggestions.filter((s) => !has(s)).slice(0, 8);

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="field flex flex-wrap items-center gap-1.5 py-2">
        {value.map((tag) => (
          <span key={tag} className={`chip pr-0.5 ${chip}`}>
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="p-0.5 hover:bg-mocha/15"
              aria-label={`Remove ${tag}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(',')) add(v.slice(0, -1));
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => draft && add(draft)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent py-0.5 outline-none placeholder:text-mocha-muted/70"
        />
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="border border-dashed border-mocha/50 px-2 py-0.5 text-xs hover:border-mocha hover:bg-lemon"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const SKILL_SUGGESTIONS = ['React', 'Node.js', 'Python', 'Figma', 'UI/UX design', 'MongoDB', 'Swift', 'Machine learning', 'Pitching', 'Data visualization'];
export const INTEREST_SUGGESTIONS = ['Edtech', 'AI for good', 'Sustainability', 'Healthcare', 'Fintech', 'Accessibility', 'Games', 'Social impact'];
