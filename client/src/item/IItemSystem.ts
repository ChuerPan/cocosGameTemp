export interface ItemConfig {
  id: string;
  name: string;
  type: ItemType;
  rarity: Rarity;
  maxStack: number;
  description: string;
  [key: string]: any;
}

export enum ItemType {
  CONSUMABLE = 'consumable',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material'
}

export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface InventorySlot {
  index: number;
  item: InventoryItem | null;
}

export interface IItemSystem {
  addItem(itemId: string, quantity: number): boolean;
  removeItem(itemId: string, quantity: number): boolean;
  swapItems(slot1: number, slot2: number): boolean;
  getItems(): InventoryItem[];
  getItemAtSlot(slot: number): InventoryItem | null;
  getSlotCount(): number;
  onItemSystemChanged: () => void;
}