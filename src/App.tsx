import { useState } from 'react';
import { useGameEngine } from './adapters/react/hooks/useGameEngine';
import { Grid } from './adapters/react/components/Grid';
import { OrderList } from './adapters/react/components/OrderList';
import { RecipeBook } from './adapters/react/components/RecipeBook';
import { ConfirmationModal } from './adapters/react/components/ConfirmationModal';
import { SaveSystem } from './core/systems/SaveSystem';
import { GridCell } from './core/types/Grid';
import { Factory, FactoryType } from './core/types/Factory';
import './App.css';

function App() {
  const { engine, gameState } = useGameEngine();
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [pendingFactory, setPendingFactory] = useState<Factory | null>(null);
  const [pendingFactoryType, setPendingFactoryType] = useState<FactoryType | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  if (!engine || !gameState) {
    return <div>Loading...</div>;
  }

  const handleOrderClick = (orderId: string) => {
    if (selectedCell && selectedCell.materialId) {
      engine.fulfillOrder(orderId, selectedCell.position);
      setSelectedCell(null);
    }
  };

  const handleBuyFactory = (factoryTypeId: string) => {
    const factory = engine.purchaseFactory(factoryTypeId);
    if (factory) {
      const factoryType = engine.getFactoryType(factoryTypeId);
      setPendingFactory(factory);
      setPendingFactoryType(factoryType);
    }
  };

  const handleFactoryPlacement = (cell: GridCell) => {
    if (pendingFactory && cell) {
      const placed = engine.placeFactory(pendingFactory.id, cell.position);
      if (placed) {
        setPendingFactory(null);
        setPendingFactoryType(null);
      }
    }
  };

  const handleCancelPlacement = () => {
    setPendingFactory(null);
    setPendingFactoryType(null);
  };

  const handleStartOver = () => {
    setShowResetModal(true);
  };

  const handleConfirmReset = () => {
    SaveSystem.clear();
    setShowResetModal(false);
    // Reload the page to start fresh
    window.location.reload();
  };

  const handleCancelReset = () => {
    setShowResetModal(false);
  };

  return (
    <div className="app">
      <ConfirmationModal
        isOpen={showResetModal}
        title="Start Over?"
        message="Are you sure you want to start over? This will delete your current progress and cannot be undone."
        confirmText="Start Over"
        cancelText="Cancel"
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />
      <div className="top-bar">
        <div className="score">
          <span>Score: {gameState.score}</span>
          <button className="start-over-button" onClick={handleStartOver}>
            Start Over
          </button>
        </div>
        <OrderList
          orders={gameState.orders}
          engine={engine}
          unlockedSlots={gameState.unlockedOrderSlots}
          maxSlots={gameState.maxOrderSlots}
          slotCost={engine.getNextOrderSlotCost()}
          currentScore={gameState.score}
          onOrderClick={handleOrderClick}
          hasSelection={!!selectedCell}
        />
      </div>
      <div className="main-content">
        {pendingFactory && pendingFactoryType && (
          <div className="placement-mode-banner">
            <span>Placing {pendingFactoryType.icon} {pendingFactoryType.name}</span>
            <span className="placement-instructions">Click an empty cell to place</span>
            <button className="cancel-placement-button" onClick={handleCancelPlacement}>Cancel</button>
          </div>
        )}
        <div className="game-area">
          <Grid
            grid={gameState.grid}
            engine={engine}
            selectedCell={selectedCell}
            onSelectedCellChange={setSelectedCell}
            pendingFactory={pendingFactory}
            pendingFactoryType={pendingFactoryType}
            onFactoryPlacement={handleFactoryPlacement}
            onCancelPlacement={handleCancelPlacement}
          />
        </div>
        <div className="sidebar">
          <RecipeBook
            recipes={engine.getRecipes()}
            engine={engine}
            currentScore={gameState.score}
            onBuyFactory={handleBuyFactory}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
