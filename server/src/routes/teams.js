import { Router } from 'express';
import { z } from 'zod';
import { Team } from '../models/Team.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { objectId } from '../lib/schemas.js';
import { PUBLIC_PROFILE_FIELDS } from '../models/User.js';
import { badRequest, notFound } from '../lib/errors.js';

const renameSchema = z.object({ name: z.string().trim().max(60) });

async function findMyTeamOr404(teamId, userId) {
  if (!objectId.safeParse(teamId).success) throw badRequest('Invalid team id.');
  const team = await Team.findOne({ _id: teamId, members: userId });
  if (!team) throw notFound("Team not found, or you're not on it.");
  return team;
}

export function teamsRouter(config) {
  const router = Router();
  router.use(requireAuth(config));

  // Every team you're on, across hackathons.
  router.get('/', async (req, res) => {
    const teams = await Team.find({ members: req.userId })
      .populate('members', PUBLIC_PROFILE_FIELDS)
      .populate('hackathon', 'name slug startsAt endsAt location maxTeamSize')
      .sort({ createdAt: -1 });
    res.json({ teams });
  });

  router.patch('/:id', validate(renameSchema), async (req, res) => {
    const team = await findMyTeamOr404(req.params.id, req.userId);
    team.name = req.valid.body.name;
    await team.save();
    res.json({ team });
  });

  // Leaving a team of two dissolves it.
  router.post('/:id/leave', async (req, res) => {
    const team = await findMyTeamOr404(req.params.id, req.userId);
    const updated = await Team.findByIdAndUpdate(
      team._id,
      { $pull: { members: req.userId } },
      { new: true },
    );
    if (updated && updated.members.length < 2) await Team.deleteOne({ _id: team._id });
    res.json({ left: true });
  });

  return router;
}
