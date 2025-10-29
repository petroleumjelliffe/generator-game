import { useGameEngine } from './adapters/react/hooks/useGameEngine';
import { Grid } from './adapters/react/components/Grid';
import { OrderList } from './adapters/react/components/OrderList';
import { RecipeBook } from './adapters/react/components/RecipeBook';
import './App.css';

function App() {
  const { engine, gameState } = useGameEngine();

  if (!engine || !gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      <div className="top-bar">
        <div className="score">Score: {gameState.score}</div>
        <OrderList
          orders={gameState.orders}
          engine={engine}
          unlockedSlots={gameState.unlockedOrderSlots}
          maxSlots={gameState.maxOrderSlots}
          slotCost={30}
          currentScore={gameState.score}
        />
      </div>
      <div className="main-content">
        <div className="game-area">
          <Grid grid={gameState.grid} engine={engine} />
        </div>
        <div className="sidebar">
          <RecipeBook recipes={engine.getRecipes()} engine={engine} currentScore={gameState.score} />
        </div>
      </div>
    </div>
  );
}

export default App;
