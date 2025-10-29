export interface Material {
  id: string;
  name: string;
  type: 'raw' | 'processed' | 'product';
  tier: number;
  icon: string;
  reward: number;
}
