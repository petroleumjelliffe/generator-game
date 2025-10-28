import { GridCell as GridCellType } from '../../../core/types/Grid';
import { Material } from '../../../core/types/Material';

interface GridCellProps {
  cell: GridCellType;
  material: Material | undefined;
  onDragStart: (cell: GridCellType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (cell: GridCellType) => void;
  onUnlock: (cell: GridCellType) => void;
  unlockCost: number;
  canAfford: boolean;
}

export function GridCell({ cell, material, onDragStart, onDragOver, onDrop, onUnlock, unlockCost, canAfford }: GridCellProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (cell.materialId && !cell.inUse && !cell.locked) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(cell));
      onDragStart(cell);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!cell.locked) {
      onDrop(cell);
    }
  };

  const handleClick = () => {
    if (cell.locked && canAfford) {
      onUnlock(cell);
    }
  };

  if (cell.locked) {
    return (
      <div
        className={`grid-cell grid-cell-locked ${canAfford ? 'can-afford' : 'cannot-afford'}`}
        onClick={handleClick}
        title={canAfford ? `Unlock for ${unlockCost} points` : `Locked (need ${unlockCost} points)`}
        style={{
          cursor: canAfford ? 'pointer' : 'not-allowed',
        }}
      >
        <div className="lock-icon">🔒</div>
        <div className="unlock-cost">{unlockCost}</div>
      </div>
    );
  }

  return (
    <div
      className="grid-cell"
      draggable={!!cell.materialId && !cell.inUse}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      style={{
        opacity: cell.inUse ? 0.5 : 1,
        cursor: cell.materialId && !cell.inUse ? 'grab' : 'default',
      }}
    >
      {material && (
        <div className="material-icon" title={material.name}>
          {material.icon}
        </div>
      )}
    </div>
  );
}
