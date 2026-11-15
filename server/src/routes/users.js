import { Router } from 'express';
import { User, PUBLIC_PROFILE_FIELDS } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, objectId } from '../lib/schemas.js';
import { notFound, badRequest } from '../lib/errors.js';

export function usersRouter(config) {
  const router = Router();
  router.use(requireAuth(config));

  router.patch('/me', validate(updateProfileSchema), async (req, res) => {
    const user = await User.findByIdAndUpdate(req.userId, req.valid.body, {
      new: true,
      runValidators: true,
    });
    if (!user) throw notFound('Your account no longer exists.');
    res.json({ user });
  });

  router.get('/:id', async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw badRequest('Invalid user id.');
    const user = await User.findById(req.params.id).select(PUBLIC_PROFILE_FIELDS);
    if (!user) throw notFound('User not found.');
    res.json({ user });
  });

  return router;
}
