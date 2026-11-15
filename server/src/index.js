import mongoose from 'mongoose';
import { loadConfig } from './config.js';
import { createApp } from './app.js';

const config = loadConfig();

await mongoose.connect(config.mongoUri);
console.log('Connected to MongoDB');

const server = createApp(config).listen(config.port, () => {
  console.log(`Matchathon API listening on http://localhost:${config.port}`);
});

async function shutdown() {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
