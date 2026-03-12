import { AccountManager, StorageType } from '../src/account/AccountManager';
import { ItemManager } from '../src/item/ItemManager';

async function testAccountSystem() {
  console.log('=== Testing Account System ===');
  
  // 初始化 AccountManager 为本地模式
  const accountManager = AccountManager.getInstance({ storageType: StorageType.LOCAL });
  
  // 测试认证
  const authResult = await accountManager.authenticate('testuser', 'password');
  console.log('Authentication result:', authResult);
  
  // 测试获取用户数据
  const userData = await accountManager.getUserData();
  console.log('User data:', userData);
  
  // 测试保存用户数据
  userData.username = 'updateduser';
  const saveResult = await accountManager.saveUserData(userData);
  console.log('Save result:', saveResult);
  
  // 测试同步到云端
  const syncResult = await accountManager.syncToCloud();
  console.log('Sync result:', syncResult);
  
  // 测试登出
  accountManager.logout();
  console.log('Logged out:', !accountManager.getIsAuthenticated());
  
  console.log('=== Account System Test Complete ===\n');
}

async function testInventorySystem() {
  console.log('=== Testing Inventory System ===');
  
  // 初始化 AccountManager
  const accountManager = AccountManager.getInstance({ storageType: StorageType.LOCAL });
  await accountManager.authenticate('testuser', 'password');
  
  // 初始化 ItemManager
  const itemManager = new ItemManager();
  
  // 加载用户数据到背包
  const userData = await accountManager.getUserData();
  itemManager.loadInventory(userData.inventory);
  
  // 测试添加道具
  console.log('Adding health potions...');
  itemManager.addItem('potion_health', 5);
  
  // 测试添加装备
  console.log('Adding iron sword...');
  itemManager.addItem('sword_iron', 1);
  
  // 测试添加材料
  console.log('Adding wood...');
  itemManager.addItem('wood', 100);
  
  // 测试获取道具列表
  const items = itemManager.getItems();
  console.log('Inventory items:', items);
  
  // 测试移除道具
  console.log('Removing 2 health potions...');
  itemManager.removeItem('potion_health', 2);
  
  // 测试交换道具位置
  console.log('Swapping items...');
  itemManager.swapItems(0, 1);
  
  // 测试获取更新后的道具列表
  const updatedItems = itemManager.getItems();
  console.log('Updated inventory items:', updatedItems);
  
  console.log('=== Inventory System Test Complete ===\n');
}

async function runAllTests() {
  try {
    await testAccountSystem();
    await testInventorySystem();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runAllTests();
