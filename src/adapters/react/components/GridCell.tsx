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
  isSelected: boolean;
  isPlacementTarget: boolean;
  pendingFactoryType: FactoryType | null;
  onLongPressStart: (cell: GridCellType) => void;
  onLongPressEnd: () => void;
  onLongPressCancel: () => void;
  isPurchasableOutputCell: boolean;
  isOwnedOutputCell: boolean;
  isPotentialOutputCell: boolean;
  isFactorySelected: boolean;
  outputCellCost: number;
  canAffordOutputCell: boolean;
}

export function GridCell({
  cell,
  material,
  factory,
  factoryType,
  factoryProgress,
  onDragStart,
  onDragOver,
  onDrop,
  onCellClick,
  isSelected,
  isPlacementTarget,
  pendingFactoryType,
  onLongPressStart,
  onLongPressEnd,
  onLongPressCancel,
  isPurchasableOutputCell,
  isOwnedOutputCell,
  isPotentialOutputCell,
  isFactorySelected,
  outputCellCost,
  canAffordOutputCell,
}: GridCellProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // Allow dragging materials - show only icon
    if (cell.materialId && !cell.inUse && material) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(cell));
      // Create custom drag image showing only the icon
      const dragEl = document.createElement('div');
      dragEl.textContent = material.icon;
      dragEl.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        font-size: 2rem;
        padding: 8px;
        background: transparent;
      `;
      document.body.appendChild(dragEl);
      e.dataTransfer.setDragImage(dragEl, 24, 24);
      requestAnimationFrame(() => document.body.removeChild(dragEl));
      onDragStart(cell);
    }
    // Allow dragging factories - show full cell (default behavior)
    else if (cell.factoryId) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify(cell));
      onDragStart(cell);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(cell, e);
  };

  const handleClick = () => {
    onCellClick(cell);
  };

  // Touch event handlers for long press
  const handleTouchStart = () => {
    onLongPressStart(cell);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent the delayed click event
    onLongPressEnd();
    onCellClick(cell);
  };

  const handleTouchCancel = () => {
    onLongPressCancel();
  };

  // Mouse event handlers for long press (desktop)
  const handleMouseDown = () => {
    onLongPressStart(cell);
  };

  const handleMouseUp = () => {
    onLongPressEnd();
  };

  const handleMouseLeave = () => {
    onLongPressCancel();
  };

  // Build class names
  const classNames = ['grid-cell'];
  if (isSelected) classNames.push('grid-cell-selected');
  if (factory) classNames.push('has-factory');
  if (isFactorySelected) classNames.push('factory-selected');
  if (isPlacementTarget) classNames.push('placement-target');
  if (isPurchasableOutputCell) classNames.push('purchasable-output-cell');
  if (isOwnedOutputCell) classNames.push('owned-output-cell');
  if (isPotentialOutputCell && !isOwnedOutputCell) classNames.push('potential-output-cell');
  if (isPurchasableOutputCell && canAffordOutputCell) classNames.push('can-afford');
  if (isPurchasableOutputCell && !canAffordOutputCell) classNames.push('cannot-afford');

  return (
    <div
      className={classNames.join(' ')}
      draggable={(!!cell.materialId && !cell.inUse) || !!cell.factoryId}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: cell.inUse ? 0.5 : 1,
        cursor: isPlacementTarget || isPurchasableOutputCell ? 'pointer' : ((cell.materialId && !cell.inUse) || cell.factoryId ? 'pointer' : 'default'),
      }}
      title={isPurchasableOutputCell ? (canAffordOutputCell ? `Buy output cell for ${outputCellCost}` : `Need ${outputCellCost} points`) : undefined}
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
          {/* Output direction indicators */}
          {factory.outputOffsets.map((offset, i) => {
            // Map offset to direction class
            let dirClass = '';
            if (offset.x === 0 && offset.y === -1) dirClass = 'output-arrow-top';
            else if (offset.x === 0 && offset.y === 1) dirClass = 'output-arrow-bottom';
            else if (offset.x === -1 && offset.y === 0) dirClass = 'output-arrow-left';
            else if (offset.x === 1 && offset.y === 0) dirClass = 'output-arrow-right';
            else if (offset.x === -1 && offset.y === -1) dirClass = 'output-arrow-top-left';
            else if (offset.x === 1 && offset.y === -1) dirClass = 'output-arrow-top-right';
            else if (offset.x === -1 && offset.y === 1) dirClass = 'output-arrow-bottom-left';
            else if (offset.x === 1 && offset.y === 1) dirClass = 'output-arrow-bottom-right';
            return dirClass ? <div key={i} className={`output-arrow ${dirClass}`} /> : null;
          })}
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
      {isPurchasableOutputCell && (
        <div className="output-cell-cost">
          <span className="cost-value">{outputCellCost}</span>
        </div>
      )}
      {isOwnedOutputCell && !material && (
        <div className="output-cell-marker">⬡</div>
      )}
    </div>
  );
}
