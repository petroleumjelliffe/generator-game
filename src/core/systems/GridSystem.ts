import { GridState, GridCell, GridPosition } from '../types/Grid';

export class GridSystem {
  private grid: GridState;

  constructor(width: number, height: number) {
    this.grid = this.createEmptyGrid(width, height);
  }

  private createEmptyGrid(width: number, height: number): GridState {
    const cells: GridCell[] = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        cells.push({
          position: { x, y },
          materialId: null,
          inUse: false,
        });
      }
    }
    return { width, height, cells };
  }

  getGrid(): GridState {
    return this.grid;
  }

  getCell(position: GridPosition): GridCell | null {
    return this.grid.cells.find(
      cell => cell.position.x === position.x && cell.position.y === position.y
    ) || null;
  }

  setCell(position: GridPosition, materialId: string | null, inUse: boolean = false): boolean {
    const cell = this.getCell(position);
    if (!cell) return false;

    cell.materialId = materialId;
    cell.inUse = inUse;
    return true;
  }

  setCellInUse(position: GridPosition, inUse: boolean): boolean {
    const cell = this.getCell(position);
    if (!cell) return false;

    cell.inUse = inUse;
    return true;
  }

  getMaterialAt(position: GridPosition): string | null {
    const cell = this.getCell(position);
    return cell?.materialId || null;
  }

  removeMaterialAt(position: GridPosition): string | null {
    const cell = this.getCell(position);
    if (!cell) return null;

    const materialId = cell.materialId;
    cell.materialId = null;
    cell.inUse = false;
    return materialId;
  }

  getEmptyCells(): GridCell[] {
    return this.grid.cells.filter(cell => cell.materialId === null && !cell.inUse);
  }

  getRandomEmptyCell(): GridCell | null {
    const emptyCells = this.getEmptyCells();
    if (emptyCells.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  isCellAvailable(position: GridPosition): boolean {
    const cell = this.getCell(position);
    return cell !== null && cell.materialId === null && !cell.inUse;
  }

  isCellOccupied(position: GridPosition): boolean {
    const cell = this.getCell(position);
    return cell !== null && cell.materialId !== null;
  }
}
