import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../lib/schemas.js';
import { conflict, unauthorized, notFound } from '../lib/errors.js';

const BCRYPT_ROUNDS = 10;

export function authRouter(config) {
  const router = Router();

  // Slow down password guessing: 20 attempts per 15 minutes per IP.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: config.disableRateLimit ? 0 : 20,
    skip: () => Boolean(config.disableRateLimit),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again in a few minutes.' },
  });

  router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
    const { password, ...profile } = req.valid.body;

    if (await User.exists({ email: profile.email })) {
      throw conflict('An account with that email already exists.');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ ...profile, passwordHash });

    res.status(201).json({ token: signToken(user._id, config), user });
  });

  router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
    const { email, password } = req.valid.body;
    const user = await User.findOne({ email }).select('+passwordHash');

    // Same message for "no such user" and "wrong password" so emails can't be probed.
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) throw unauthorized('Email or password is incorrect.');

    res.json({ token: signToken(user._id, config), user });
  });

  router.get('/me', requireAuth(config), async (req, res) => {
    const user = await User.findById(req.userId).populate('hackathons');
    if (!user) throw notFound('Your account no longer exists.');
    res.json({ user });
  });

  return router;
}
