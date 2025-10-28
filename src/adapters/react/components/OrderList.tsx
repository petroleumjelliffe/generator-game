import { Order } from '../../../core/types/Order';
import { GameEngine } from '../../../core/GameEngine';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  engine: GameEngine;
}

export function OrderList({ orders, engine }: OrderListProps) {
  return (
    <div className="order-list">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          material={engine.getMaterial(order.materialId)}
          engine={engine}
        />
      ))}
    </div>
  );
}
