import jwt from 'jsonwebtoken';
import { unauthorized } from '../lib/errors.js';

export function signToken(userId, config) {
  return jwt.sign({ sub: String(userId) }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

/**
 * Require a valid `Authorization: Bearer <token>` header.
 * Sets req.userId — routes act on the logged-in user, never on an email or id from the URL.
 */
export function requireAuth(config) {
  return (req, _res, next) => {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return next(unauthorized());

    try {
      const payload = jwt.verify(token, config.jwtSecret);
      req.userId = payload.sub;
      next();
    } catch {
      next(unauthorized('Your session expired. Log in again.'));
    }
  };
}
