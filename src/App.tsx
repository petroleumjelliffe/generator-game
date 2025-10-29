import { useState } from 'react';
import { useGameEngine } from './adapters/react/hooks/useGameEngine';
import { Grid } from './adapters/react/components/Grid';
import { OrderList } from './adapters/react/components/OrderList';
import { RecipeBook } from './adapters/react/components/RecipeBook';
import { GridCell } from './core/types/Grid';
import './App.css';

function App() {
  const { engine, gameState } = useGameEngine();
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);

  if (!engine || !gameState) {
    return <div>Loading...</div>;
  }

  const handleOrderClick = (orderId: string) => {
    if (selectedCell && selectedCell.materialId) {
      engine.fulfillOrder(orderId, selectedCell.position);
      setSelectedCell(null);
    }
  };

  return (
    <div className="app">
      <div className="top-bar">
        <div className="score">Score: {gameState.score}</div>
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
        <div className="game-area">
          <Grid
            grid={gameState.grid}
            engine={engine}
            selectedCell={selectedCell}
            onSelectedCellChange={setSelectedCell}
          />
        </div>
        <div className="sidebar">
          <RecipeBook recipes={engine.getRecipes()} engine={engine} currentScore={gameState.score} />
        </div>
      </div>
    </div>
  );
}

export default App;
