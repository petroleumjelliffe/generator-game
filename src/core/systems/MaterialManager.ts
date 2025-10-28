import { Material } from '../types/Material';

export class MaterialManager {
  private materials: Map<string, Material> = new Map();

  addMaterial(material: Material): void {
    this.materials.set(material.id, material);
  }

  addMaterials(materials: Material[]): void {
    materials.forEach(material => this.addMaterial(material));
  }

  getMaterial(id: string): Material | undefined {
    return this.materials.get(id);
  }

  getAllMaterials(): Material[] {
    return Array.from(this.materials.values());
  }

  getRawMaterials(): Material[] {
    return this.getAllMaterials().filter(m => m.type === 'raw');
  }

  getMaterialsByType(type: 'raw' | 'processed' | 'product'): Material[] {
    return this.getAllMaterials().filter(m => m.type === type);
  }

  getRandomRawMaterial(): Material | null {
    const rawMaterials = this.getRawMaterials();
    if (rawMaterials.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * rawMaterials.length);
    return rawMaterials[randomIndex];
  }
}
