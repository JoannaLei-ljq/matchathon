// Database side of matching: who is eligible, recording swipes, and forming teams.
// The ranking itself lives in scoring.js.

import { User, PUBLIC_PROFILE_FIELDS } from '../models/User.js';
import { Hackathon } from '../models/Hackathon.js';
import { Swipe } from '../models/Swipe.js';
import { Team } from '../models/Team.js';
import { badRequest, forbidden, notFound } from '../lib/errors.js';
import { rankCandidates } from './scoring.js';

async function loadContext(userId, hackathonId) {
  const [me, hackathon] = await Promise.all([
    User.findById(userId),
    Hackathon.findById(hackathonId),
  ]);
  if (!me) throw notFound('Your account no longer exists.');
  if (!hackathon) throw notFound('Hackathon not found.');
  if (!me.hackathons.some((id) => id.equals(hackathon._id))) {
    throw forbidden('Join this hackathon to start matching.');
  }
  return { me, hackathon };
}

function teamOf(userId, hackathonId) {
  return Team.findOne({ hackathon: hackathonId, members: userId });
}

/**
 * The best next person for `userId` to look at, at one hackathon.
 * Returns { candidate: null, status } when there is nobody to show.
 */
export async function getNextMatch(userId, hackathonId) {
  const { me, hackathon } = await loadContext(userId, hackathonId);
  const maxSize = hackathon.maxTeamSize;

  const [myTeam, alreadySwiped, likedMe, teams] = await Promise.all([
    teamOf(me._id, hackathon._id).populate('members', 'skills'),
    Swipe.distinct('to', { from: me._id, hackathon: hackathon._id }),
    Swipe.distinct('from', { to: me._id, hackathon: hackathon._id, action: 'like' }),
    Team.find({ hackathon: hackathon._id }).lean(),
  ]);

  if (myTeam && myTeam.members.length >= maxSize) {
    return { candidate: null, status: 'team_full' };
  }

  // Who can't be shown: me, people I've already decided on, and people who
  // couldn't end up on a team with me — anyone on a full team, and if I'm already
  // on a team, anyone on a different one (we don't merge teams).
  const excluded = [me._id, ...alreadySwiped];
  for (const team of teams) {
    const isMine = myTeam && team._id.equals(myTeam._id);
    if (isMine || team.members.length >= maxSize || myTeam) excluded.push(...team.members);
  }

  const candidates = await User.find({
    hackathons: hackathon._id,
    _id: { $nin: excluded },
  })
    .select(PUBLIC_PROFILE_FIELDS)
    .lean();

  if (candidates.length === 0) return { candidate: null, status: 'no_more_candidates' };

  const teamSkills = myTeam
    ? myTeam.members.filter((m) => !m._id.equals(me._id)).flatMap((m) => m.skills)
    : [];

  const [best] = rankCandidates(me, candidates, {
    teamSkills,
    likedYouIds: new Set(likedMe.map(String)),
  });

  return {
    candidate: best.candidate,
    score: best.score,
    breakdown: best.breakdown,
    sharedInterests: best.sharedInterests,
    newSkills: best.newSkills,
    reason: best.reason,
    remaining: candidates.length - 1,
  };
}

/**
 * Put two mutually-matched people on the same team, if the rules allow:
 * - neither on a team  → start a new team of two
 * - one on a team      → the other joins it, if it has room
 * - same team already  → nothing to do
 * - different teams    → teams aren't merged
 */
async function formTeam(aId, bId, hackathon) {
  const [teamA, teamB] = await Promise.all([teamOf(aId, hackathon._id), teamOf(bId, hackathon._id)]);

  if (teamA && teamB) {
    return teamA._id.equals(teamB._id)
      ? { team: teamA, status: 'already_teammates' }
      : { team: null, status: 'on_different_teams' };
  }

  if (!teamA && !teamB) {
    const team = await Team.create({ hackathon: hackathon._id, members: [aId, bId] });
    return { team, status: 'team_created' };
  }

  const existing = teamA || teamB;
  const joiner = teamA ? bId : aId;
  // Atomic "add if there's still room": only matches when the slot at index
  // maxTeamSize-1 is empty, so two people can't overfill the same team at once.
  const team = await Team.findOneAndUpdate(
    { _id: existing._id, [`members.${hackathon.maxTeamSize - 1}`]: { $exists: false } },
    { $addToSet: { members: joiner } },
    { new: true },
  );
  return team ? { team, status: 'joined_team' } : { team: null, status: 'team_full' };
}

/** Record a like or pass. On a mutual like, try to put both people on one team. */
export async function recordSwipe(userId, targetId, hackathonId, action) {
  if (String(userId) === String(targetId)) throw badRequest("You can't swipe on yourself.");

  const { me, hackathon } = await loadContext(userId, hackathonId);
  const target = await User.findOne({ _id: targetId, hackathons: hackathon._id });
  if (!target) throw notFound("That person isn't going to this hackathon.");

  await Swipe.findOneAndUpdate(
    { from: me._id, to: target._id, hackathon: hackathon._id },
    { action },
    { upsert: true, setDefaultsOnInsert: true },
  );

  if (action !== 'like') return { mutual: false };

  const likedBack = await Swipe.exists({
    from: target._id,
    to: me._id,
    hackathon: hackathon._id,
    action: 'like',
  });
  if (!likedBack) return { mutual: false };

  const { team, status } = await formTeam(me._id, target._id, hackathon);
  if (team) await team.populate('members', PUBLIC_PROFILE_FIELDS);
  return { mutual: true, status, team };
}

/** People who liked `userId` and whom `userId` liked back, at one hackathon. */
export async function listMutualMatches(userId, hackathonId) {
  const { me, hackathon } = await loadContext(userId, hackathonId);
  const [iLiked, likedMe] = await Promise.all([
    Swipe.distinct('to', { from: me._id, hackathon: hackathon._id, action: 'like' }),
    Swipe.distinct('from', { to: me._id, hackathon: hackathon._id, action: 'like' }),
  ]);
  const likedMeSet = new Set(likedMe.map(String));
  const mutualIds = iLiked.filter((id) => likedMeSet.has(String(id)));
  return User.find({ _id: { $in: mutualIds } }).select(PUBLIC_PROFILE_FIELDS);
}
