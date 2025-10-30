import { GridCell as GridCellType } from '../../../core/types/Grid';
import { Material } from '../../../core/types/Material';
import { Factory } from '../../../core/types/Factory';
import { FactoryType } from '../../../core/types/Factory';

interface GridCellProps {
  cell: GridCellType;
  material: Material | undefined;
  factory: Factory | undefined;
  factoryType: FactoryType | undefined;
  factoryProgress: number;
  onDragStart: (cell: GridCellType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (cell: GridCellType, e: React.DragEvent) => void;
  onCellClick: (cell: GridCellType) => void;
  unlockCost: number;
  canAfford: boolean;
  isSelected: boolean;
  isPlacementTarget: boolean;
  pendingFactoryType: FactoryType | null;
}

export function GridCell({ cell, material, factory, factoryType, factoryProgress, onDragStart, onDragOver, onDrop, onCellClick, unlockCost, canAfford, isSelected, isPlacementTarget, pendingFactoryType }: GridCellProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // Allow dragging materials
    if (cell.materialId && !cell.inUse && !cell.locked) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(cell));
      onDragStart(cell);
    }
    // Allow dragging factories
    else if (cell.factoryId && !cell.locked) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(cell));
      onDragStart(cell);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!cell.locked) {
      onDrop(cell, e);
    }
  };

  const handleClick = () => {
    onCellClick(cell);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent the delayed click event
    onCellClick(cell);
  };

  if (cell.locked) {
    return (
      <div
        className={`grid-cell grid-cell-locked ${canAfford ? 'can-afford' : 'cannot-afford'}`}
        onClick={handleClick}
        onTouchEnd={handleTouchEnd}
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
      className={`grid-cell ${isSelected ? 'grid-cell-selected' : ''} ${factory ? 'has-factory' : ''} ${isPlacementTarget ? 'placement-target' : ''}`}
      draggable={(!!cell.materialId && !cell.inUse) || !!cell.factoryId}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      style={{
        opacity: cell.inUse ? 0.5 : 1,
        cursor: isPlacementTarget ? 'pointer' : ((cell.materialId && !cell.inUse) || cell.factoryId ? 'pointer' : (!cell.locked && !cell.materialId ? 'pointer' : 'default')),
      }}
    >
      {factory && factoryType && (
        <div className="factory-on-grid">
          <div className="factory-grid-icon" title={factoryType.name}>
            {factoryType.icon}
          </div>
          <div className="factory-grid-progress-bar">
            <div
              className="factory-grid-progress-fill"
              style={{ width: `${factoryProgress * 100}%` }}
            />
          </div>
        </div>
      )}
      {material && !factory && (
        <div className="material-icon" title={material.name}>
          {material.icon}
        </div>
      )}
      {isPlacementTarget && pendingFactoryType && (
        <div className="placement-preview" title={`Place ${pendingFactoryType.name}`}>
          {pendingFactoryType.icon}
        </div>
      )}
    </div>
  );
}
