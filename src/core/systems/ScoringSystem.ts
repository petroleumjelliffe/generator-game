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
}
