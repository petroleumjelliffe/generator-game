import { useState } from 'react';
import { Order } from '../../../core/types/Order';
import { Material } from '../../../core/types/Material';
import { GameEngine } from '../../../core/GameEngine';
import { GridCell } from '../../../core/types/Grid';

interface OrderCardProps {
  order: Order;
  material: Material | undefined;
  engine: GameEngine;
  onOrderClick?: (order: Order) => void;
}

export function OrderCard({ order, material, engine, onOrderClick }: OrderCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Get the dragged cell data
    const cellData = e.dataTransfer.getData('application/json');
    if (!cellData) return;

    const cell: GridCell = JSON.parse(cellData);
    engine.fulfillOrder(order.id, cell.position);
  };

  const handleClick = () => {
    if (onOrderClick) {
      onOrderClick(order);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (onOrderClick) {
      e.preventDefault(); // Prevent the delayed click event
      onOrderClick(order);
    }
  };

  return (
    <div
      className={`order-card ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: onOrderClick ? 'pointer' : 'default',
      }}
    >
      <div className="order-icon">{material?.icon}</div>
      <div className="order-details">
        <div className="order-name">{material?.name}</div>
        <div className="order-quantity">x{order.quantity}</div>
        <div className="order-reward">{order.reward} pts</div>
      </div>
    </div>
  );
}
