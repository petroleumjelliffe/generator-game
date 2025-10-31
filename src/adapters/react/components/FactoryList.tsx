import { useEffect, useState } from 'react';
import { Factory } from '../../../core/types/Factory';
import { GameEngine } from '../../../core/GameEngine';

interface FactoryListProps {
  factories: Factory[];
  engine: GameEngine;
  unlockedSlots: number;
  maxSlots: number;
  currentScore: number;
}

export function FactoryList({ factories, engine, unlockedSlots, maxSlots, currentScore }: FactoryListProps) {
  const [, forceUpdate] = useState({});

  // Force re-render every 100ms to animate factory progress bars
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleUnlockSlot = () => {
    engine.unlockFactorySlot();
  };

  const handleBuyGarden = () => {
    engine.purchaseGarden();
  };

  // Get factories not placed on grid (in slots)
  const unplacedFactories = factories.filter(f => f.position === null);

  // Create array of all slots
  const slots = [];

  // Add unplaced factories
  for (let i = 0; i < unplacedFactories.length; i++) {
    slots.push({ type: 'factory', factory: unplacedFactories[i] });
  }

  // Add empty unlocked slots
  for (let i = unplacedFactories.length; i < unlockedSlots; i++) {
    slots.push({ type: 'empty' });
  }

  // Add locked slots
  for (let i = unlockedSlots; i < maxSlots; i++) {
    slots.push({ type: 'locked' });
  }

  const nextSlotCost = engine.getNextFactorySlotCost();
  const canAffordSlot = currentScore >= nextSlotCost;
  const gardenCost = 50; // Match config
  const canAffordGarden = currentScore >= gardenCost;

  return (
    <div className="factory-section">
      <h4 className="factory-section-title">Factories</h4>
      <div className="factory-list">
        {slots.map((slot, index) => {
          if (slot.type === 'factory') {
            const factory = slot.factory!;
            const factoryType = engine.getFactoryType(factory.typeId);
            const progress = engine.getFactoryProductionProgress(factory.id);

            return (
              <div
                key={factory.id}
                className="factory-slot factory-active"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = 'move';
                  e.dataTransfer.setData('factoryId', factory.id);
                }}
              >
                <div className="factory-icon">{factoryType?.icon}</div>
                <div className="factory-name">{factoryType?.name}</div>
                <div className="factory-progress-bar">
                  <div
                    className="factory-progress-fill"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>
            );
          } else if (slot.type === 'empty') {
            return (
              <div
                key={`empty-${index}`}
                className="factory-slot factory-empty"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const cellData = e.dataTransfer.getData('application/json');
                  if (cellData) {
                    const cell = JSON.parse(cellData);
                    if (cell.factoryId) {
                      // Move factory back to slot (remove from grid)
                      engine.moveFactory(cell.factoryId, null);
                    }
                  }
                }}
              >
                <button
                  className="buy-garden-button"
                  onClick={handleBuyGarden}
                  disabled={!canAffordGarden}
                  title={canAffordGarden ? `Buy Garden (${gardenCost} pts)` : `Need ${gardenCost} points`}
                >
                  <span className="buy-garden-icon">🌱</span>
                  <span className="buy-garden-cost">{gardenCost}</span>
                </button>
              </div>
            );
          } else {
            // locked slot
            const isNextSlot = index === unlockedSlots;
            return (
              <div
                key={`locked-${index}`}
                className={`factory-slot factory-locked ${isNextSlot && canAffordSlot ? 'can-afford' : ''} ${isNextSlot && !canAffordSlot ? 'cannot-afford' : ''}`}
                onClick={isNextSlot && canAffordSlot ? handleUnlockSlot : undefined}
                title={isNextSlot ? (canAffordSlot ? `Unlock for ${nextSlotCost} points` : `Locked (need ${nextSlotCost} points)`) : 'Locked'}
                style={{
                  cursor: isNextSlot && canAffordSlot ? 'pointer' : 'not-allowed',
                }}
              >
                <div className="lock-icon">🔒</div>
                {isNextSlot && <div className="unlock-cost">{nextSlotCost}</div>}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
