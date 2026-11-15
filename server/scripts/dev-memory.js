// Zero-setup development server: starts a throwaway in-memory MongoDB, fills it
// with sample data, and runs the API. Nothing is saved when you stop it.
//   npm run dev:memory
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { seedDatabase } from './seed.js';

const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri('matchathon'));
console.log('Started in-memory MongoDB (data resets when you stop the server)');
await seedDatabase();

const port = Number(process.env.PORT) || 5001;
const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-memory-secret',
  jwtExpiresIn: '7d',
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(','),
};
const server = createApp(config).listen(port, () => {
  console.log(`Matchathon API listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
