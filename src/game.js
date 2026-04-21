const DEFAULT_VISIBLE_STEPS = 9;
const DEFAULT_LANES = 3;

export class EndlessStairsGame {
  constructor({
    visibleSteps = DEFAULT_VISIBLE_STEPS,
    lanes = DEFAULT_LANES,
    baseSpeed = 1,
    speedStep = 0.15,
    upcomingSafeLanes = [],
  } = {}) {
    this.visibleSteps = visibleSteps;
    this.lanes = lanes;
    this.baseSpeed = baseSpeed;
    this.speedStep = speedStep;
    this.upcomingSafeLanes = [...upcomingSafeLanes];
    this.score = 0;
    this.gameOver = false;
    this.playerLane = Math.floor(this.lanes / 2);

    this.steps = [{ safeLane: this.playerLane }];
    while (this.steps.length < this.visibleSteps) {
      this.steps.push({ safeLane: this.#nextSafeLane() });
    }
  }

  step(directionDelta) {
    if (this.gameOver) {
      throw new Error('The game is over. Restart to play again.');
    }

    const nextLane = this.#clampLane(this.playerLane + directionDelta);
    const nextStep = this.steps[1];

    if (nextLane !== nextStep.safeLane) {
      this.gameOver = true;
      return {
        status: 'fell',
        lane: nextLane,
        score: this.score,
      };
    }

    this.playerLane = nextLane;
    this.score += 1;
    this.steps.shift();
    this.steps.push({ safeLane: this.#nextSafeLane() });

    return {
      status: 'advanced',
      lane: this.playerLane,
      score: this.score,
      speed: this.getSpeed(),
    };
  }

  forfeit(reason = 'forfeit') {
    if (this.gameOver) {
      throw new Error('The game is over. Restart to play again.');
    }

    this.gameOver = true;
    return {
      status: reason,
      score: this.score,
    };
  }

  getVisibleSteps() {
    return this.steps.map((step, index) => ({
      index,
      safeLane: step.safeLane,
      isCurrent: index === 0,
    }));
  }

  getPlayerState() {
    return {
      lane: this.playerLane,
    };
  }

  getScore() {
    return this.score;
  }

  getSpeed() {
    return Number((this.baseSpeed + Math.floor(this.score / 5) * this.speedStep).toFixed(2));
  }

  isGameOver() {
    return this.gameOver;
  }

  #clampLane(lane) {
    return Math.max(0, Math.min(this.lanes - 1, lane));
  }

  #nextSafeLane() {
    if (this.upcomingSafeLanes.length > 0) {
      return this.#clampLane(this.upcomingSafeLanes.shift());
    }

    const drift = Math.floor(Math.random() * 3) - 1;
    return this.#clampLane(this.steps.at(-1).safeLane + drift);
  }
}
