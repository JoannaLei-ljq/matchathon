// The matching algorithm. Pure functions only — no database — so it is easy to
// unit test and easy to explain.
//
// Goal: a good teammate shares what you care about (interests) but brings what
// your team is missing (skills). Each candidate gets a 0–100 score:
//
//   interests  45%  Jaccard similarity of interests  |A ∩ B| / |A ∪ B|
//   skills     45%  How many skills they add that you and your current team
//                   don't already have. Three or more new skills = full marks.
//   likedYou   10%  They already liked your card, so a match is more likely.
//                   (Used for ranking only — never revealed to the user.)

import { normalizeTag, tagSet } from '../lib/tags.js';

export const WEIGHTS = { interests: 0.45, skills: 0.45, likedYou: 0.1 };
export const NEW_SKILLS_FOR_FULL_MARKS = 3;

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let shared = 0;
  for (const x of a) if (b.has(x)) shared += 1;
  return shared / (a.size + b.size - shared);
}

/** Items of `tags` (original spelling) whose normalized form is in / not in `set`. */
function pick(tags, set, keep) {
  return tags.filter((t) => set.has(normalizeTag(t)) === keep);
}

/**
 * Score one candidate for `me`.
 * @param {object} me         { skills, interests }
 * @param {object} candidate  { firstName, skills, interests }
 * @param {object} context    { teamSkills?: string[], likedYou?: boolean }
 */
export function scoreCandidate(me, candidate, { teamSkills = [], likedYou = false } = {}) {
  const myInterests = tagSet(me.interests);
  const theirInterests = tagSet(candidate.interests);
  const covered = tagSet([...(me.skills || []), ...teamSkills]);

  const sharedInterests = pick(candidate.interests || [], myInterests, true);
  const newSkills = pick(candidate.skills || [], covered, false);

  const interestScore = jaccard(myInterests, theirInterests);
  const skillScore = Math.min(newSkills.length / NEW_SKILLS_FOR_FULL_MARKS, 1);
  const likedYouScore = likedYou ? 1 : 0;

  const score = Math.round(
    100 *
      (WEIGHTS.interests * interestScore +
        WEIGHTS.skills * skillScore +
        WEIGHTS.likedYou * likedYouScore),
  );

  return {
    score,
    sharedInterests,
    newSkills,
    breakdown: {
      interests: Math.round(100 * interestScore),
      skills: Math.round(100 * skillScore),
    },
    reason: explainMatch(candidate.firstName, sharedInterests, newSkills),
  };
}

function listToText(items, max = 3) {
  const shown = items.slice(0, max);
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} and ${shown.at(-1)}`;
}

/** A one-sentence, human-readable reason built from the score's ingredients. */
export function explainMatch(name, sharedInterests, newSkills) {
  const who = name || 'They';
  const interests = listToText(sharedInterests);
  const skills = listToText(newSkills);

  if (interests && skills) {
    return `You both care about ${interests}, and ${who} brings ${skills} — skills your team doesn't have yet.`;
  }
  if (interests) {
    return `You both care about ${interests}. Your skills overlap, so you'd start from common ground.`;
  }
  if (skills) {
    return `${who} brings ${skills}, which your team doesn't have yet.`;
  }
  return `${who} is going to the same hackathon.`;
}

/**
 * Rank candidates best-first. Ties break on id so results are deterministic.
 * @param {object} me
 * @param {object[]} candidates  each needs `_id`
 * @param {object} context       { teamSkills?: string[], likedYouIds?: Set<string> }
 */
export function rankCandidates(me, candidates, { teamSkills = [], likedYouIds = new Set() } = {}) {
  return candidates
    .map((candidate) => ({
      candidate,
      ...scoreCandidate(me, candidate, {
        teamSkills,
        likedYou: likedYouIds.has(String(candidate._id)),
      }),
    }))
    .sort((a, b) => b.score - a.score || String(a.candidate._id).localeCompare(String(b.candidate._id)));
}
