// Skills and interests are free-text tags. We keep the user's original spelling
// for display but compare on a normalized key so "React", "react " and "REACT"
// count as the same thing.

export function normalizeTag(tag) {
  return String(tag).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Trim, drop empties, and de-duplicate (case-insensitively) while keeping order. */
export function cleanTags(tags = []) {
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    const display = String(raw).trim().replace(/\s+/g, ' ');
    const key = normalizeTag(display);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(display);
  }
  return result;
}

export function tagSet(tags = []) {
  return new Set(tags.map(normalizeTag));
}
