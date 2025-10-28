import { GridCell as GridCellType } from '../../../core/types/Grid';
import { Material } from '../../../core/types/Material';

interface GridCellProps {
  cell: GridCellType;
  material: Material | undefined;
  onDragStart: (cell: GridCellType) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (cell: GridCellType) => void;
}

export function GridCell({ cell, material, onDragStart, onDragOver, onDrop }: GridCellProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (cell.materialId && !cell.inUse) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(cell));
      onDragStart(cell);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(cell);
  };

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
