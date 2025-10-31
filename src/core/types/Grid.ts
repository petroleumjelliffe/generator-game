export interface GridPosition {
  x: number;
  y: number;
}

export interface GridCell {
  position: GridPosition;
  materialId: string | null;
  inUse: boolean; // true if being used in active crafting
  locked: boolean; // true if cell needs to be unlocked before use
  factoryId: string | null; // id of factory occupying this cell
}

export interface GridState {
  width: number;
  height: number;
  cells: GridCell[];
}
