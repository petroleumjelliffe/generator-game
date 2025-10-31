import { useState, useEffect } from 'react';
import { GridState, GridCell as GridCellType } from '../../../core/types/Grid';
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

export function Grid({ grid, engine, selectedCell, onSelectedCellChange, pendingFactory, pendingFactoryType, onFactoryPlacement, onCancelPlacement }: GridProps) {
  const [draggedCell, setDraggedCell] = useState<GridCellType | null>(null);
  const [, forceUpdate] = useState({});
  const unlockCost = engine.getNextCellUnlockCost();
  const currentScore = engine.getScore();
  const canAfford = currentScore >= unlockCost;

  // Force re-render every 100ms to animate factory progress bars
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 100);

    return () => clearInterval(interval);
  }, []);

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

  const handleUnlock = (cell: GridCellType) => {
    engine.unlockCell(cell.position);
  };

  const handleCellClick = (cell: GridCellType) => {
    // If in placement mode, try to place factory
    if (pendingFactory) {
      // Can only place on unlocked, empty cells
      if (!cell.locked && !cell.materialId && !cell.factoryId) {
        onFactoryPlacement(cell);
      }
      return;
    }

    // If cell has a factory, speed it up
    if (cell.factoryId) {
      engine.speedUpFactory(cell.factoryId, 1000); // Remove 1 second
      return;
    }

    // If cell is locked, handle unlocking
    if (cell.locked && canAfford) {
      handleUnlock(cell);
      return;
    }

    // If a material is selected and clicking an empty cell, move material there
    if (selectedCell && !cell.locked && !cell.materialId && !cell.factoryId && !cell.inUse) {
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
          const isPlacementTarget = !!pendingFactory && !cell.locked && !cell.materialId && !cell.factoryId;

          return (
            <GridCell
              key={`${cell.position.x}-${cell.position.y}`}
              cell={cell}
              material={cell.materialId ? engine.getMaterial(cell.materialId) : undefined}
              factory={factory}
              factoryType={factoryType}
              factoryProgress={factoryProgress}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onCellClick={handleCellClick}
              unlockCost={unlockCost}
              canAfford={canAfford}
              isSelected={isSelected(cell)}
              isPlacementTarget={isPlacementTarget}
              pendingFactoryType={pendingFactoryType}
            />
          );
        })}
      </div>
    </div>
  );
}
