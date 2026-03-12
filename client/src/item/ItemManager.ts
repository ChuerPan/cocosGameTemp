import { IItemSystem, ItemConfig, InventoryItem, InventorySlot, ItemType, Rarity } from './IItemSystem';
import { AccountManager } from '../account/AccountManager';

export class ItemManager implements IItemSystem {
  private slots: InventorySlot[];
  private itemConfigs: Map<string, ItemConfig>;
  public onItemSystemChanged: () => void = () => {};

  constructor(slotCount: number = 20) {
    this.slots = Array(slotCount).fill(null).map((_, index) => ({
      index,
      item: null
    }));
    this.itemConfigs = new Map();
    this.loadItemConfigs();
  }

  addItem(itemId: string, quantity: number): boolean {
    if (!this.itemConfigs.has(itemId)) {
      return false;
    }

    const itemConfig = this.itemConfigs.get(itemId)!;
    const maxStack = itemConfig.maxStack;

    // 寻找已有堆叠
    for (const slot of this.slots) {
      if (slot.item && slot.item.itemId === itemId && slot.item.quantity < maxStack) {
        const availableSpace = maxStack - slot.item.quantity;
        const addAmount = Math.min(quantity, availableSpace);
        slot.item.quantity += addAmount;
        quantity -= addAmount;

        if (quantity === 0) {
          this.saveInventory();
          this.onItemSystemChanged();
          return true;
        }
      }
    }

    // 寻找空槽位
    for (const slot of this.slots) {
      if (!slot.item) {
        slot.item = {
          itemId,
          quantity
        };
        this.saveInventory();
        this.onItemSystemChanged();
        return true;
      }
    }

    return false;
  }

  removeItem(itemId: string, quantity: number): boolean {
    let removed = 0;

    for (const slot of this.slots) {
      if (slot.item && slot.item.itemId === itemId) {
        const removeAmount = Math.min(quantity - removed, slot.item.quantity);
        slot.item.quantity -= removeAmount;
        removed += removeAmount;

        if (slot.item.quantity === 0) {
          slot.item = null;
        }

        if (removed === quantity) {
          this.saveInventory();
          this.onItemSystemChanged();
          return true;
        }
      }
    }

    return false;
  }

  swapItems(slot1: number, slot2: number): boolean {
    if (slot1 < 0 || slot1 >= this.slots.length || slot2 < 0 || slot2 >= this.slots.length) {
      return false;
    }

    const temp = this.slots[slot1].item;
    this.slots[slot1].item = this.slots[slot2].item;
    this.slots[slot2].item = temp;

    this.saveInventory();
    this.onItemSystemChanged();
    return true;
  }

  getItems(): InventoryItem[] {
    return this.slots.filter(slot => slot.item).map(slot => slot.item!);
  }

  getItemAtSlot(slot: number): InventoryItem | null {
    if (slot < 0 || slot >= this.slots.length) {
      return null;
    }
    return this.slots[slot].item;
  }

  getSlotCount(): number {
    return this.slots.length;
  }

  loadInventory(items: InventoryItem[]): void {
    this.slots = Array(this.slots.length).fill(null).map((_, index) => ({
      index,
      item: null
    }));

    let slotIndex = 0;
    for (const item of items) {
      if (slotIndex < this.slots.length) {
        this.slots[slotIndex].item = item;
        slotIndex++;
      } else {
        break;
      }
    }

    this.onItemSystemChanged();
  }

  private async saveInventory(): Promise<void> {
    try {
      const accountManager = AccountManager.getInstance();
      const userData = await accountManager.getUserData();
      userData.inventory = this.getItems();
      await accountManager.saveUserData(userData);
    } catch (error) {
      console.error('Failed to save inventory:', error);
    }
  }

  private loadItemConfigs(): void {
    // 实际项目中应从配置文件加载
    const defaultConfigs: ItemConfig[] = [
      {
        id: 'potion_health',
        name: 'Health Potion',
        type: ItemType.CONSUMABLE,
        rarity: Rarity.COMMON,
        maxStack: 99,
        description: 'Restores health'
      },
      {
        id: 'sword_iron',
        name: 'Iron Sword',
        type: ItemType.EQUIPMENT,
        rarity: Rarity.UNCOMMON,
        maxStack: 1,
        description: 'Basic iron sword'
      },
      {
        id: 'wood',
        name: 'Wood',
        type: ItemType.MATERIAL,
        rarity: Rarity.COMMON,
        maxStack: 999,
        description: 'Basic crafting material'
      }
    ];

    for (const config of defaultConfigs) {
      this.itemConfigs.set(config.id, config);
    }
  }

  getItemConfig(itemId: string): ItemConfig | undefined {
    return this.itemConfigs.get(itemId);
  }
}