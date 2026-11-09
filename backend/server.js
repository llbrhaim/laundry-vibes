'use strict';
require('dotenv').config();

const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const { createApp } = require('./app');

const REQUIRED = ['MONGODB_URI', 'SESSION_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env (or set them on your hosting dashboard).');
  process.exit(1);
}
if (process.env.SESSION_SECRET.length < 32) {
  console.warn('Warning: SESSION_SECRET should be at least 32 characters long.');
}
if (process.env.ADMIN_PASSWORD.length < 10) {
  console.warn('Warning: ADMIN_PASSWORD is short. Use a longer, harder-to-guess password.');
}

const PORT = Number(process.env.PORT) || 4000;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Make sure indexes (like unique slug) exist before taking requests
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));

  const app = createApp({
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    sessionSecret: process.env.SESSION_SECRET,
    sessionStore: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
      ttl: 8 * 60 * 60,
    }),
  });

  const server = app.listen(PORT, () => {
    console.log(`Laundry Vibes running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});
