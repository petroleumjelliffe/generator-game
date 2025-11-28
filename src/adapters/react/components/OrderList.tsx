import { Order } from '../../../core/types/Order';
import { GameEngine } from '../../../core/GameEngine';
import { OrderCard } from './OrderCard';

interface OrderListProps {
  orders: Order[];
  engine: GameEngine;
  unlockedSlots: number;
  maxSlots: number;
  slotCost: number;
  currentScore: number;
  onOrderClick?: (orderId: string) => void;
  hasSelection?: boolean;
  seenAffordableOrderSlots: Record<number, boolean>;
  onSlotSeen: (slotIndex: number) => void;
}

export function OrderList({ orders, engine, unlockedSlots, maxSlots, slotCost, currentScore, onOrderClick, hasSelection, seenAffordableOrderSlots, onSlotSeen }: OrderListProps) {
  const handleUnlockSlot = (slotIndex: number) => {
    onSlotSeen(slotIndex);
    engine.unlockOrderSlot();
  };

  const handleUnlockSlotTouch = (e: React.TouchEvent, slotIndex: number) => {
    e.preventDefault(); // Prevent the delayed click event
    onSlotSeen(slotIndex);
    engine.unlockOrderSlot();
  };

  // Create array of all slots (both filled and empty)
  const slots = [];

  // Add active orders
  for (let i = 0; i < orders.length; i++) {
    slots.push({ type: 'order', order: orders[i] });
  }

  // Add empty unlocked slots
  for (let i = orders.length; i < unlockedSlots; i++) {
    slots.push({ type: 'empty' });
  }

  // Add locked slots
  for (let i = unlockedSlots; i < maxSlots; i++) {
    slots.push({ type: 'locked' });
  }

  const canAfford = currentScore >= slotCost;

  return (
    <div className="order-list">
      {slots.map((slot, index) => {
        if (slot.type === 'order') {
          return (
            <OrderCard
              key={slot.order!.id}
              order={slot.order!}
              material={engine.getMaterial(slot.order!.materialId)}
              engine={engine}
              onOrderClick={hasSelection && onOrderClick ? () => onOrderClick(slot.order!.id) : undefined}
            />
          );
        } else if (slot.type === 'empty') {
          return (
            <div key={`empty-${index}`} className="order-card order-empty">
              <div className="order-empty-text">Empty</div>
            </div>
          );
        } else {
          // locked slot
          const isNextSlot = index === unlockedSlots;
          const isNewlyAffordable = isNextSlot && canAfford && !seenAffordableOrderSlots[index];
          return (
            <div
              key={`locked-${index}`}
              className={`order-card order-locked ${isNextSlot && canAfford ? 'can-afford' : ''} ${isNextSlot && !canAfford ? 'cannot-afford' : ''} ${isNewlyAffordable ? 'order-newly-affordable' : ''}`}
              data-newly-affordable={isNewlyAffordable ? 'true' : 'false'}
              onClick={isNextSlot && canAfford ? () => handleUnlockSlot(index) : undefined}
              onTouchEnd={isNextSlot && canAfford ? (e) => handleUnlockSlotTouch(e, index) : undefined}
              title={isNextSlot ? (canAfford ? `Unlock for ${slotCost} points` : `Locked (need ${slotCost} points)`) : 'Locked'}
              style={{
                cursor: isNextSlot && canAfford ? 'pointer' : 'not-allowed',
              }}
            >
              <div className="lock-icon">🔒</div>
              {isNextSlot && <div className="unlock-cost">{slotCost}</div>}
            </div>
          );
        }
      })}
    </div>
  );
}
