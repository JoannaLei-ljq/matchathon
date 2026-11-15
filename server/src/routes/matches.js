import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { hackathonQuerySchema, objectId } from '../lib/schemas.js';
import { getNextMatch, recordSwipe, listMutualMatches } from '../services/matching.js';

const swipeSchema = z.object({
  hackathon: objectId,
  userId: objectId,
  action: z.enum(['like', 'pass']),
});

export function matchesRouter(config) {
  const router = Router();
  router.use(requireAuth(config));

  // GET /api/matches/next?hackathon=<id> — the best next card to show.
  router.get('/next', validate(hackathonQuerySchema, 'query'), async (req, res) => {
    res.json(await getNextMatch(req.userId, req.valid.query.hackathon));
  });

  // POST /api/matches/swipe { hackathon, userId, action: "like" | "pass" }
  router.post('/swipe', validate(swipeSchema), async (req, res) => {
    const { hackathon, userId, action } = req.valid.body;
    res.json(await recordSwipe(req.userId, userId, hackathon, action));
  });

  // GET /api/matches?hackathon=<id> — everyone you've mutually matched with.
  router.get('/', validate(hackathonQuerySchema, 'query'), async (req, res) => {
    res.json({ matches: await listMutualMatches(req.userId, req.valid.query.hackathon) });
  });

  return router;
}
