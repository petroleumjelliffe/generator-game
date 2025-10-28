export class ScoringSystem {
  private score: number = 0;

  addScore(points: number): void {
    this.score += points;
  }

  getScore(): number {
    return this.score;
  }

  resetScore(): void {
    this.score = 0;
  }

  canAfford(cost: number): boolean {
    return this.score >= cost;
  }

  spendPoints(cost: number): boolean {
    if (!this.canAfford(cost)) return false;
    this.score -= cost;
    return true;
  }
}
