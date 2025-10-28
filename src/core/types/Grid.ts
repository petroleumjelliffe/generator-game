export interface GridPosition {
  x: number;
  y: number;
}

export interface GridCell {
  position: GridPosition;
  materialId: string | null;
  inUse: boolean; // true if being used in active crafting
}

export interface GridState {
  width: number;
  height: number;
  cells: GridCell[];
}
