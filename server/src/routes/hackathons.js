import { Router } from 'express';
import { Hackathon } from '../models/Hackathon.js';
import { User } from '../models/User.js';
import { Team } from '../models/Team.js';
import { requireAuth } from '../middleware/auth.js';
import { objectId } from '../lib/schemas.js';
import { notFound, badRequest, conflict } from '../lib/errors.js';

async function findHackathonOr404(id) {
  if (!objectId.safeParse(id).success) throw badRequest('Invalid hackathon id.');
  const hackathon = await Hackathon.findById(id);
  if (!hackathon) throw notFound('Hackathon not found.');
  return hackathon;
}

export function hackathonsRouter(config) {
  const router = Router();
  router.use(requireAuth(config));

  // Upcoming and ongoing hackathons first, with how many people are going.
  router.get('/', async (_req, res) => {
    const hackathons = await Hackathon.find().sort({ startsAt: 1 }).lean();
    const counts = await User.aggregate([
      { $unwind: '$hackathons' },
      { $group: { _id: '$hackathons', count: { $sum: 1 } } },
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json({
      hackathons: hackathons.map((h) => ({ ...h, attendeeCount: countById.get(String(h._id)) || 0 })),
    });
  });

  router.get('/:id', async (req, res) => {
    const hackathon = await findHackathonOr404(req.params.id);
    const attendeeCount = await User.countDocuments({ hackathons: hackathon._id });
    res.json({ hackathon: { ...hackathon.toJSON(), attendeeCount } });
  });

  router.post('/:id/join', async (req, res) => {
    const hackathon = await findHackathonOr404(req.params.id);
    await User.updateOne({ _id: req.userId }, { $addToSet: { hackathons: hackathon._id } });
    res.json({ joined: true, hackathon });
  });

  router.delete('/:id/join', async (req, res) => {
    const hackathon = await findHackathonOr404(req.params.id);
    if (await Team.exists({ hackathon: hackathon._id, members: req.userId })) {
      throw conflict('Leave your team for this hackathon first.');
    }
    await User.updateOne({ _id: req.userId }, { $pull: { hackathons: hackathon._id } });
    res.json({ joined: false });
  });

  return router;
}
