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
  const [tapCounts, setTapCounts] = useState<Map<string, number>>(new Map());
  const unlockCost = 50;
  const currentScore = engine.getScore();
  const canAfford = currentScore >= unlockCost;

  const handleDragStart = (cell: GridCellType) => {
    setDraggedCell(cell);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetCell: GridCellType) => {
    if (!draggedCell) return;

    // Prevent dropping onto the same cell
    if (draggedCell.position.x === targetCell.position.x &&
        draggedCell.position.y === targetCell.position.y) {
      setDraggedCell(null);
      return;
    }

    // Try to craft
    const positions = [draggedCell.position, targetCell.position];
    engine.startCrafting(positions);

    setDraggedCell(null);
  };

  const handleUnlock = (cell: GridCellType) => {
    engine.unlockCell(cell.position, unlockCost);
  };

  const handleTap = (cell: GridCellType) => {
    const key = `${cell.position.x},${cell.position.y}`;
    const currentTaps = tapCounts.get(key) || 0;
    const newTaps = currentTaps + 1;

    if (newTaps >= 5) {
      // Spawn a seed
      engine.spawnMaterialAt(cell.position, 'seed');
      setTapCounts(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    } else {
      setTapCounts(prev => {
        const newMap = new Map(prev);
        newMap.set(key, newTaps);
        return newMap;
      });
    }
  };

  const getTapCount = (cell: GridCellType): number => {
    const key = `${cell.position.x},${cell.position.y}`;
    return tapCounts.get(key) || 0;
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
            onUnlock={handleUnlock}
            onTap={handleTap}
            tapCount={getTapCount(cell)}
            unlockCost={unlockCost}
            canAfford={canAfford}
          />
        ))}
      </div>
    </div>
  );
}
