// End-to-end API tests against a throwaway in-memory MongoDB.
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';
import { Hackathon } from '../src/models/Hackathon.js';

let mongo;
let app;
let hackathon;

const config = {
  jwtSecret: 'test-secret',
  jwtExpiresIn: '1h',
  clientOrigins: ['http://localhost:3000'],
  disableRateLimit: true,
};

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = createApp(config);
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
  hackathon = await Hackathon.create({
    name: 'Test Hacks',
    slug: 'test-hacks',
    startsAt: new Date('2027-01-01'),
    endsAt: new Date('2027-01-02'),
    maxTeamSize: 3,
  });
});

async function signUp(firstName, skills, interests, { join = true } = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: `${firstName}@example.com`, password: 'password123', firstName, skills, interests })
    .expect(201);
  const { token, user } = res.body;
  if (join) {
    await request(app).post(`/api/hackathons/${hackathon._id}/join`).set('Authorization', `Bearer ${token}`).expect(200);
  }
  return { token, id: user._id, auth: { Authorization: `Bearer ${token}` } };
}

const next = (u) => request(app).get(`/api/matches/next?hackathon=${hackathon._id}`).set(u.auth);
const swipe = (u, target, action) =>
  request(app)
    .post('/api/matches/swipe')
    .set(u.auth)
    .send({ hackathon: String(hackathon._id), userId: target.id, action });

test('register never returns the password hash, and duplicate emails are rejected', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: 'Ana@Example.com', password: 'password123', firstName: 'Ana' })
    .expect(201);
  assert.equal(res.body.user.email, 'ana@example.com');
  assert.equal(res.body.user.passwordHash, undefined);

  await request(app)
    .post('/api/auth/register')
    .send({ email: 'ana@example.com', password: 'password123', firstName: 'Ana' })
    .expect(409);
});

test('login works with the right password only', async () => {
  await signUp('Bea', [], [], { join: false });
  await request(app).post('/api/auth/login').send({ email: 'bea@example.com', password: 'wrong-pass' }).expect(401);
  const res = await request(app).post('/api/auth/login').send({ email: 'bea@example.com', password: 'password123' }).expect(200);
  assert.ok(res.body.token);
});

test('protected routes need a valid token', async () => {
  await request(app).get('/api/auth/me').expect(401);
  await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-token').expect(401);
});

test('validation errors come back as 400 with field details', async () => {
  const res = await request(app).post('/api/auth/register').send({ email: 'nope', password: 'short' }).expect(400);
  const fields = res.body.details.map((d) => d.field).sort();
  assert.deepEqual(fields, ['email', 'firstName', 'password']);
});

test('you can only edit your own profile, and other people cannot see your email', async () => {
  const cat = await signUp('Cat', ['Go'], [], { join: false });
  const dee = await signUp('Dee', [], [], { join: false });

  const updated = await request(app).patch('/api/users/me').set(cat.auth).send({ bio: 'Hi!', skills: ['Go', 'go', 'Rust'] }).expect(200);
  assert.deepEqual(updated.body.user.skills, ['Go', 'Rust'], 'duplicate tags are removed');

  await request(app).patch('/api/users/me').set(cat.auth).send({ email: 'hijack@example.com' }).expect(400);

  const seen = await request(app).get(`/api/users/${cat.id}`).set(dee.auth).expect(200);
  assert.equal(seen.body.user.bio, 'Hi!');
  assert.equal(seen.body.user.email, undefined);
});

test('matching requires joining the hackathon', async () => {
  const loner = await signUp('Lou', ['Go'], ['Climate'], { join: false });
  await next(loner).expect(403);
});

test('next match picks the most complementary person and explains why', async () => {
  const me = await signUp('Me', ['Node.js', 'MongoDB'], ['Edtech']);
  await signUp('Clone', ['Node.js', 'MongoDB'], ['Edtech']);
  const designer = await signUp('Alex', ['React', 'Figma', 'CSS'], ['Edtech']);
  await signUp('Stranger', ['Node.js'], ['Fintech']);

  const res = await next(me).expect(200);
  assert.equal(res.body.candidate._id, designer.id);
  assert.equal(res.body.candidate.email, undefined, 'candidate email stays private');
  assert.match(res.body.reason, /Edtech/);
  assert.match(res.body.reason, /React/);
  assert.equal(res.body.remaining, 2);
});

test('passing removes someone from your queue', async () => {
  const me = await signUp('Me', ['Node.js'], ['Edtech']);
  const a = await signUp('Alex', ['React', 'Figma', 'CSS'], ['Edtech']);
  const b = await signUp('Bo', ['Go'], []);

  await swipe(me, a, 'pass').expect(200);
  assert.equal((await next(me)).body.candidate._id, b.id);
  await swipe(me, b, 'pass').expect(200);
  assert.equal((await next(me)).body.status, 'no_more_candidates');
});

test('mutual likes form a team, a third person joins, and a full team stops matching', async () => {
  // maxTeamSize is 3 for this hackathon.
  const a = await signUp('Ari', ['Node.js'], ['Edtech']);
  const b = await signUp('Ben', ['React'], ['Edtech']);
  const c = await signUp('Cy', ['Figma'], ['Edtech']);
  const d = await signUp('Dot', ['Go'], ['Edtech']);

  const oneWay = await swipe(a, b, 'like').expect(200);
  assert.equal(oneWay.body.mutual, false);

  const created = await swipe(b, a, 'like').expect(200);
  assert.equal(created.body.mutual, true);
  assert.equal(created.body.status, 'team_created');
  assert.equal(created.body.team.members.length, 2);

  await swipe(c, a, 'like').expect(200);
  const joined = await swipe(a, c, 'like').expect(200);
  assert.equal(joined.body.status, 'joined_team');
  assert.equal(joined.body.team.members.length, 3);

  assert.equal((await next(a)).body.status, 'team_full');
  // Dot can't be shown anyone from the full team.
  assert.equal((await next(d)).body.status, 'no_more_candidates');

  const teams = await request(app).get('/api/teams').set(b.auth).expect(200);
  assert.equal(teams.body.teams.length, 1);
  assert.equal(teams.body.teams[0].hackathon.name, 'Test Hacks');

  const matches = await request(app).get(`/api/matches?hackathon=${hackathon._id}`).set(a.auth).expect(200);
  assert.equal(matches.body.matches.length, 2);
});

test('teammates’ skills count when ranking the next person', async () => {
  const a = await signUp('Ari', ['Node.js'], ['Edtech']);
  const b = await signUp('Ben', ['React', 'CSS'], ['Edtech']);
  const frontend = await signUp('Fae', ['React', 'CSS'], ['Edtech']);
  const designer = await signUp('Dez', ['Figma', 'Illustration'], ['Edtech']);

  // Before Ari has a team, the two candidates tie on score; once Ben (React, CSS)
  // is a teammate, Dez's design skills are the ones the team is missing.
  await swipe(a, b, 'like');
  await swipe(b, a, 'like');
  const res = await next(a).expect(200);
  assert.equal(res.body.candidate._id, designer.id);
  assert.notEqual(res.body.candidate._id, frontend.id);
});

test('leaving a team of two dissolves it', async () => {
  const a = await signUp('Ari', ['Node.js'], ['Edtech']);
  const b = await signUp('Ben', ['React'], ['Edtech']);
  await swipe(a, b, 'like');
  const { body } = await swipe(b, a, 'like');

  await request(app).post(`/api/teams/${body.team._id}/leave`).set(a.auth).expect(200);
  const teams = await request(app).get('/api/teams').set(b.auth).expect(200);
  assert.equal(teams.body.teams.length, 0);
});

test('you cannot swipe on yourself or on someone not at the hackathon', async () => {
  const a = await signUp('Ari', ['Node.js'], ['Edtech']);
  const outsider = await signUp('Out', ['Go'], [], { join: false });
  await swipe(a, a, 'like').expect(400);
  await swipe(a, outsider, 'like').expect(404);
});
