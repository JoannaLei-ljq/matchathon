import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}. See server/.env.example.`);
  }
  return value;
}

export function loadConfig() {
  const jwtSecret = required('JWT_SECRET');
  if (process.env.NODE_ENV === 'production' && (jwtSecret === 'change-me' || jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET must be a long random string in production.');
  }

  return {
    mongoUri: required('MONGO_URI'),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    port: Number(process.env.PORT) || 5001,
    clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
