import test from 'node:test';
import assert from 'node:assert/strict';
import { EndlessStairsGame } from '../src/game.js';

test('starts with a centered staircase and player on the safe tile', () => {
  const game = new EndlessStairsGame();

  const initialView = game.getVisibleSteps();
  const player = game.getPlayerState();

  assert.equal(initialView.length, 9);
  assert.equal(player.lane, 1);
  assert.equal(initialView[0].safeLane, 1);
  assert.equal(game.getScore(), 0);
  assert.equal(game.isGameOver(), false);
});

test('advancing onto the next safe stair increases score and keeps the run alive', () => {
  const game = new EndlessStairsGame({ upcomingSafeLanes: [2, 0, 1] });

  const result = game.step(1); // move from center lane(1) to lane 2

  assert.equal(result.status, 'advanced');
  assert.equal(game.getScore(), 1);
  assert.equal(game.isGameOver(), false);
  assert.equal(game.getPlayerState().lane, 2);
  assert.equal(game.getVisibleSteps()[0].safeLane, 2);
});

test('stepping into a missing stair ends the game and locks the score', () => {
  const game = new EndlessStairsGame({ upcomingSafeLanes: [0, 1, 2] });

  const result = game.step(1); // move from center lane(1) to lane 2, but next safe lane is 0

  assert.equal(result.status, 'fell');
  assert.equal(game.isGameOver(), true);
  assert.equal(game.getScore(), 0);
  assert.throws(() => game.step(0), /game is over/i);
});

test('difficulty ramps by increasing speed every five safe steps', () => {
  const game = new EndlessStairsGame({
    upcomingSafeLanes: [1, 1, 1, 1, 1, 1, 1],
    baseSpeed: 1,
    speedStep: 0.15,
  });

  for (let i = 0; i < 5; i += 1) {
    const result = game.step(0);
    assert.equal(result.status, 'advanced');
  }

  assert.equal(game.getScore(), 5);
  assert.equal(game.getSpeed(), 1.15);
});

test('forfeit immediately ends the run without changing the score', () => {
  const game = new EndlessStairsGame({ upcomingSafeLanes: [1, 2, 1] });

  const result = game.forfeit('timeout');

  assert.equal(result.status, 'timeout');
  assert.equal(game.isGameOver(), true);
  assert.equal(game.getScore(), 0);
  assert.throws(() => game.step(0), /game is over/i);
});
