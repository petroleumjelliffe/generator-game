import { useState, useEffect, useRef, useCallback } from 'react';
import { GridState, GridCell as GridCellType, GridPosition } from '../../../core/types/Grid';
import { GameEngine } from '../../../core/GameEngine';
import { Factory, FactoryType } from '../../../core/types/Factory';
import { GridCell } from './GridCell';

interface GridProps {
  grid: GridState;
  engine: GameEngine;
  selectedCell: GridCellType | null;
  onSelectedCellChange: (cell: GridCellType | null) => void;
  pendingFactory: Factory | null;
  pendingFactoryType: FactoryType | null;
  onFactoryPlacement: (cell: GridCellType) => void;
  onCancelPlacement: () => void;
}

const LONG_PRESS_DURATION = 500; // milliseconds

export function Grid({ grid, engine, selectedCell, onSelectedCellChange, pendingFactory, pendingFactoryType, onFactoryPlacement }: GridProps) {
  const [draggedCell, setDraggedCell] = useState<GridCellType | null>(null);
  const [, forceUpdate] = useState({});
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressTriggeredRef = useRef(false);
  const currentScore = engine.getScore();

  // Force re-render every 100ms to animate factory progress bars
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Get output cell info for selected factory
  const outputCellCost = selectedFactory ? engine.getOutputCellCost(selectedFactory.id) : 0;
  const canAffordOutputCell = currentScore >= outputCellCost;
  const purchasableOffsets = selectedFactory ? engine.getPurchasableOutputOffsets(selectedFactory.id) : [];

  // Check if a position is a purchasable output cell for the selected factory
  const isPurchasableOutputCell = useCallback((cell: GridCellType): GridPosition | null => {
    if (!selectedFactory || !selectedFactory.position) return null;

    const offsetX = cell.position.x - selectedFactory.position.x;
    const offsetY = cell.position.y - selectedFactory.position.y;

    const isPurchasable = purchasableOffsets.some(
      offset => offset.x === offsetX && offset.y === offsetY
    );

    return isPurchasable ? { x: offsetX, y: offsetY } : null;
  }, [selectedFactory, purchasableOffsets]);

  // Get all placed factories
  const factories = engine.getFactories();

  // Check if a position is an owned output cell for ANY placed factory
  const isOwnedOutputCell = (cell: GridCellType): boolean => {
    for (const factory of factories) {
      if (!factory.position) continue;
      const outputPositions = engine.getFactoryOutputPositions(factory.id);
      if (outputPositions.some(pos => pos.x === cell.position.x && pos.y === cell.position.y)) {
        return true;
      }
    }
    return false;
  };

  // Check if a position is a potential (unpurchased) output cell for ANY placed factory
  // These are cells within the 3x3 area around a factory that haven't been purchased yet
  const isPotentialOutputCell = (cell: GridCellType): boolean => {
    for (const factory of factories) {
      if (!factory.position) continue;

      // Check if cell is within 3x3 area (offset -1 to 1 in both directions)
      const offsetX = cell.position.x - factory.position.x;
      const offsetY = cell.position.y - factory.position.y;

      // Must be adjacent (within 1 cell) but not the factory cell itself
      if (Math.abs(offsetX) <= 1 && Math.abs(offsetY) <= 1 && !(offsetX === 0 && offsetY === 0)) {
        // Check if this offset is NOT already owned
        const isOwned = factory.outputOffsets.some(o => o.x === offsetX && o.y === offsetY);
        if (!isOwned) {
          return true;
        }
      }
    }
    return false;
  };

  // Long press handlers for factory selection
  const handleLongPressStart = useCallback((cell: GridCellType) => {
    if (!cell.factoryId) return;

    longPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      const factory = engine.getFactory(cell.factoryId!);
      if (factory) {
        setSelectedFactory(factory);
      }
    }, LONG_PRESS_DURATION);
  }, [engine]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleLongPressCancel = useCallback(() => {
    handleLongPressEnd();
    longPressTriggeredRef.current = false;
  }, [handleLongPressEnd]);

  const handleDragStart = (cell: GridCellType) => {
    setDraggedCell(cell);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetCell: GridCellType, e: React.DragEvent) => {
    // Check if we're dropping a factory from the factory list
    const factoryId = e.dataTransfer?.getData('factoryId');
    if (factoryId) {
      // Placing a factory from slot onto grid
      if (!targetCell.locked && !targetCell.factoryId && !targetCell.materialId) {
        engine.placeFactory(factoryId, targetCell.position);
      }
      return;
    }

    if (!draggedCell) return;

    // Prevent dropping onto the same cell
    if (draggedCell.position.x === targetCell.position.x &&
        draggedCell.position.y === targetCell.position.y) {
      setDraggedCell(null);
      return;
    }

    // Check if dragging a factory
    if (draggedCell.factoryId) {
      // If target has a factory of the same type, try to combine
      if (targetCell.factoryId) {
        const draggedFactory = engine.getFactory(draggedCell.factoryId);
        const targetFactory = engine.getFactory(targetCell.factoryId);

        if (draggedFactory && targetFactory && draggedFactory.typeId === targetFactory.typeId) {
          engine.combineFactories(draggedCell.factoryId, targetCell.factoryId);
        }
      }
      // Otherwise, move the factory to the target cell
      else if (!targetCell.locked && !targetCell.materialId) {
        engine.moveFactory(draggedCell.factoryId, targetCell.position);
      }
      setDraggedCell(null);
      return;
    }

    // If dragging a material
    if (draggedCell.materialId) {
      // If target is empty, move the material
      if (!targetCell.locked && !targetCell.materialId && !targetCell.factoryId && !targetCell.inUse) {
        engine.moveMaterial(draggedCell.position, targetCell.position);
      }
      // If target has a material, try to craft
      else if (targetCell.materialId) {
        const positions = [draggedCell.position, targetCell.position];
        engine.startCrafting(positions);
      }
    }

    setDraggedCell(null);
  };

  const handleCellClick = (cell: GridCellType) => {
    // If long press was triggered, don't handle regular click
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    // If in placement mode, try to place factory
    if (pendingFactory) {
      // Can only place on empty cells
      if (!cell.materialId && !cell.factoryId) {
        onFactoryPlacement(cell);
      }
      return;
    }

    // If a factory is selected, check for output cell purchasing
    if (selectedFactory) {
      const purchasableOffset = isPurchasableOutputCell(cell);
      if (purchasableOffset && canAffordOutputCell) {
        engine.purchaseOutputCell(selectedFactory.id, purchasableOffset);
        // Refresh factory state after purchase
        const updatedFactory = engine.getFactory(selectedFactory.id);
        setSelectedFactory(updatedFactory);
        return;
      }

      // Clicking elsewhere deselects the factory
      if (!cell.factoryId || cell.factoryId !== selectedFactory.id) {
        setSelectedFactory(null);
        // Don't return - continue to handle other click logic
      }
    }

    // If cell has a factory, speed it up (short tap)
    if (cell.factoryId) {
      engine.speedUpFactory(cell.factoryId, 1000); // Remove 1 second
      return;
    }

    // If a material is selected and clicking an empty cell, move material there
    if (selectedCell && !cell.materialId && !cell.factoryId && !cell.inUse) {
      const moved = engine.moveMaterial(selectedCell.position, cell.position);
      if (moved) {
        onSelectedCellChange(null);
      }
      return;
    }

    // If cell has material, handle selection/crafting
    if (cell.materialId && !cell.inUse) {
      // If clicking the same cell, deselect
      if (selectedCell &&
          selectedCell.position.x === cell.position.x &&
          selectedCell.position.y === cell.position.y) {
        onSelectedCellChange(null);
        return;
      }

      // If no cell selected, select this one
      if (!selectedCell) {
        onSelectedCellChange(cell);
        return;
      }

      // If a cell is selected, try to craft
      const positions = [selectedCell.position, cell.position];
      engine.startCrafting(positions);
      onSelectedCellChange(null);
    }
  };


  const isSelected = (cell: GridCellType): boolean => {
    return selectedCell !== null &&
           selectedCell.position.x === cell.position.x &&
           selectedCell.position.y === cell.position.y;
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
        {grid.cells.map((cell) => {
          const factory = cell.factoryId ? engine.getFactory(cell.factoryId) : undefined;
          const factoryType = factory ? engine.getFactoryType(factory.typeId) : undefined;
          const factoryProgress = factory ? engine.getFactoryProductionProgress(factory.id) : 0;
          const isPlacementTarget = !!pendingFactory && !cell.materialId && !cell.factoryId;
          const purchasableOffset = isPurchasableOutputCell(cell);
          const isFactorySelected = selectedFactory?.id === cell.factoryId;

          return (
            <GridCell
              key={`${cell.position.x}-${cell.position.y}`}
              cell={cell}
              material={cell.materialId ? engine.getMaterial(cell.materialId) : undefined}
              factory={factory || undefined}
              factoryType={factoryType || undefined}
              factoryProgress={factoryProgress}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onCellClick={handleCellClick}
              isSelected={isSelected(cell)}
              isPlacementTarget={isPlacementTarget}
              pendingFactoryType={pendingFactoryType}
              onLongPressStart={handleLongPressStart}
              onLongPressEnd={handleLongPressEnd}
              onLongPressCancel={handleLongPressCancel}
              isPurchasableOutputCell={!!purchasableOffset}
              isOwnedOutputCell={isOwnedOutputCell(cell)}
              isPotentialOutputCell={isPotentialOutputCell(cell)}
              isFactorySelected={isFactorySelected}
              outputCellCost={outputCellCost}
              canAffordOutputCell={canAffordOutputCell}
            />
          );
        })}
      </div>
    </div>
  );
}
