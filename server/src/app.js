import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { hackathonsRouter } from './routes/hackathons.js';
import { matchesRouter } from './routes/matches.js';
import { teamsRouter } from './routes/teams.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

/** Build the Express app. Kept separate from index.js so tests can use it without listening on a port. */
export function createApp(config) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.clientOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });

  app.use('/api/auth', authRouter(config));
  app.use('/api/users', usersRouter(config));
  app.use('/api/hackathons', hackathonsRouter(config));
  app.use('/api/matches', matchesRouter(config));
  app.use('/api/teams', teamsRouter(config));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
