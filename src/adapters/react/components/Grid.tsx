import { useState } from 'react';
import { GridState, GridCell as GridCellType } from '../../../core/types/Grid';
import { GameEngine } from '../../../core/GameEngine';
import { GridCell } from './GridCell';

interface GridProps {
  grid: GridState;
  engine: GameEngine;
}

export function Grid({ grid, engine }: GridProps) {
  const [draggedCell, setDraggedCell] = useState<GridCellType | null>(null);

  const handleDragStart = (cell: GridCellType) => {
    setDraggedCell(cell);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetCell: GridCellType) => {
    if (!draggedCell) return;

    // Try to craft
    const positions = [draggedCell.position, targetCell.position];
    engine.startCrafting(positions);

    setDraggedCell(null);
  };

  return (
    <div className="grid-container">
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${grid.width}, 1fr)`,
          gridTemplateRows: `repeat(${grid.height}, 1fr)`,
        }}
      >
        {grid.cells.map((cell) => (
          <GridCell
            key={`${cell.position.x}-${cell.position.y}`}
            cell={cell}
            material={cell.materialId ? engine.getMaterial(cell.materialId) : undefined}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}
