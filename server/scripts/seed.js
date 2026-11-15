// Fill a development database with sample hackathons and people.
//   npm run seed
// Every sample account uses the password below. Never run this against production.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { loadConfig } from '../src/config.js';
import { User } from '../src/models/User.js';
import { Hackathon } from '../src/models/Hackathon.js';
import { Swipe } from '../src/models/Swipe.js';
import { Team } from '../src/models/Team.js';

export const SEED_PASSWORD = 'matcha-latte-123';

const hackathons = [
  {
    name: 'AthenaHacks 2027',
    slug: 'athenahacks-2027',
    startsAt: new Date('2027-03-06T09:00:00-08:00'),
    endsAt: new Date('2027-03-07T17:00:00-08:00'),
    location: 'Los Angeles, CA',
    description: 'A hackathon for women and non-binary hackers.',
  },
  {
    name: 'Matcha Jam',
    slug: 'matcha-jam',
    startsAt: new Date('2027-01-23T10:00:00-08:00'),
    endsAt: new Date('2027-01-24T16:00:00-08:00'),
    location: 'Online',
    description: 'A cozy weekend build sprint.',
  },
];

// [firstName, lastName, school, skills, interests, hackathon slugs, bio]
const people = [
  ['Demo', 'User', 'USC', ['Node.js', 'MongoDB', 'Express'], ['Edtech', 'AI for good', 'Sustainability'], ['athenahacks-2027', 'matcha-jam'], 'Backend person who loves clean data models.'],
  ['Alex', 'Lin', 'USC', ['React', 'Figma', 'CSS'], ['Edtech', 'Design'], ['athenahacks-2027'], 'Frontend dev who cares about cozy UIs.'],
  ['Priya', 'Shah', 'UCLA', ['Python', 'PyTorch', 'Data analysis'], ['AI for good', 'Healthcare'], ['athenahacks-2027'], 'ML student, happiest with a messy dataset.'],
  ['Maya', 'Chen', 'Caltech', ['Swift', 'iOS', 'Figma'], ['Sustainability', 'Edtech'], ['athenahacks-2027', 'matcha-jam'], 'I build small apps that nudge good habits.'],
  ['Sofia', 'Garcia', 'USC', ['Node.js', 'MongoDB'], ['Fintech'], ['athenahacks-2027'], 'Backend dev, first hackathon!'],
  ['Hana', 'Kim', 'UC Irvine', ['UX research', 'Figma', 'Illustration'], ['Edtech', 'Accessibility'], ['athenahacks-2027'], 'Designer who draws all the mascots.'],
  ['Zara', 'Ahmed', 'Stanford', ['Go', 'AWS', 'Docker'], ['Sustainability', 'Climate'], ['athenahacks-2027'], 'Infra nerd. I make deploys boring.'],
  ['Lena', 'Novak', 'USC', ['React', 'TypeScript', 'Next.js'], ['AI for good', 'Edtech'], ['athenahacks-2027', 'matcha-jam'], 'Full-stack leaning frontend.'],
  ['Ivy', 'Tran', 'UCSD', ['Product management', 'Pitching'], ['Healthcare', 'Edtech'], ['athenahacks-2027'], 'I keep the team on track and win the demo.'],
  ['Nora', 'Park', 'USC', ['Unity', 'C#', 'Blender'], ['Games', 'Edtech'], ['matcha-jam'], 'Game dev, cozy games especially.'],
  ['Rin', 'Sato', 'UCLA', ['Rust', 'WebAssembly'], ['Open source', 'Climate'], ['matcha-jam'], 'Systems programmer who likes the web.'],
  ['Elena', 'Rossi', 'USC', ['Data visualization', 'D3.js', 'Python'], ['Sustainability', 'AI for good'], ['athenahacks-2027'], 'Turning numbers into pictures.'],
];

async function seed() {
  const config = loadConfig();
  await mongoose.connect(config.mongoUri);
  console.log(`Seeding ${mongoose.connection.name}…`);

  await Promise.all([User.deleteMany({}), Hackathon.deleteMany({}), Swipe.deleteMany({}), Team.deleteMany({})]);
  await Promise.all([User.syncIndexes(), Hackathon.syncIndexes(), Swipe.syncIndexes(), Team.syncIndexes()]);

  const created = await Hackathon.insertMany(hackathons);
  const idBySlug = Object.fromEntries(created.map((h) => [h.slug, h._id]));

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);
  await User.insertMany(
    people.map(([firstName, lastName, school, skills, interests, slugs, bio]) => ({
      email: `${firstName}.${lastName}@example.com`.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      school,
      location: 'California',
      bio,
      skills,
      interests,
      hackathons: slugs.map((slug) => idBySlug[slug]),
    })),
  );

  console.log(`Created ${created.length} hackathons and ${people.length} people.`);
  console.log(`Log in as demo.user@example.com with password "${SEED_PASSWORD}".`);
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
