import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreCandidate, rankCandidates, explainMatch } from '../src/services/scoring.js';

const me = { skills: ['Node.js', 'MongoDB'], interests: ['Edtech', 'AI for good'] };

test('rewards shared interests plus complementary skills', () => {
  const frontend = { firstName: 'Alex', skills: ['React', 'Figma', 'CSS'], interests: ['Edtech', 'AI for good'] };
  const result = scoreCandidate(me, frontend);
  assert.equal(result.breakdown.interests, 100);
  assert.equal(result.breakdown.skills, 100);
  assert.equal(result.score, 90);
  assert.deepEqual(result.sharedInterests, ['Edtech', 'AI for good']);
  assert.deepEqual(result.newSkills, ['React', 'Figma', 'CSS']);
});

test('a clone of me scores low on skills', () => {
  const clone = { firstName: 'Sam', skills: ['node.js', ' MongoDB '], interests: ['Edtech', 'AI for good'] };
  const result = scoreCandidate(me, clone);
  assert.equal(result.breakdown.skills, 0, 'tags compare case- and whitespace-insensitively');
  assert.equal(result.score, 45);
});

test('skills my team already has do not count as new', () => {
  const designer = { firstName: 'Hana', skills: ['Figma', 'Illustration'], interests: ['Edtech'] };
  const alone = scoreCandidate(me, designer);
  const withDesignerTeammate = scoreCandidate(me, designer, { teamSkills: ['Figma'] });
  assert.deepEqual(withDesignerTeammate.newSkills, ['Illustration']);
  assert.ok(withDesignerTeammate.score < alone.score);
});

test('someone who already liked you gets a small boost', () => {
  const c = { firstName: 'Ivy', skills: ['Pitching'], interests: ['Edtech'] };
  const plain = scoreCandidate(me, c).score;
  const liked = scoreCandidate(me, c, { likedYou: true }).score;
  assert.equal(liked - plain, 10);
});

test('empty profiles do not crash and score zero', () => {
  const result = scoreCandidate({ skills: [], interests: [] }, { firstName: 'X', skills: [], interests: [] });
  assert.equal(result.score, 0);
  assert.equal(result.reason, 'X is going to the same hackathon.');
});

test('ranks best first and breaks ties deterministically by id', () => {
  const candidates = [
    { _id: 'b', firstName: 'B', skills: ['Go'], interests: [] },
    { _id: 'a', firstName: 'A', skills: ['Go'], interests: [] },
    { _id: 'c', firstName: 'C', skills: ['React', 'Figma', 'CSS'], interests: ['Edtech'] },
  ];
  const order = rankCandidates(me, candidates).map((r) => r.candidate._id);
  assert.deepEqual(order, ['c', 'a', 'b']);
});

test('explanations read naturally', () => {
  assert.equal(
    explainMatch('Alex', ['Edtech'], ['React', 'Figma', 'CSS', 'Vue']),
    "You both care about Edtech, and Alex brings React, Figma and CSS — skills your team doesn't have yet.",
  );
  assert.equal(explainMatch('Zara', [], ['Go']), "Zara brings Go, which your team doesn't have yet.");
  assert.match(explainMatch('Sam', ['Edtech', 'AI'], []), /^You both care about Edtech and AI\./);
});
