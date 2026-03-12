# 游戏公共功能模块

这是一个使用 TypeScript 开发的 Cocos 引擎游戏项目模板，包含账号系统和道具系统等公共功能模块。

## 项目结构

```
cocosGameTemp/
├── README.md                  # 项目说明
├── PLAN.md                    # 功能模块计划
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
├── src/
│   ├── account/               # 账号系统
│   │   ├── IAccountProvider.ts    # 账号提供者接口
│   │   ├── LocalProvider.ts       # 本地存储实现
│   │   ├── RemoteProvider.ts      # 远程存储实现
│   │   └── AccountManager.ts      # 账号管理器
│   └── inventory/             # 道具系统
│       ├── IInventory.ts          # 道具系统接口
│       └── InventoryManager.ts    # 道具管理器
└── test/
    └── test.ts                # 测试文件
```

## 功能模块

### 1. 账号系统 (Account System)

#### 核心功能
- **接口驱动设计**：定义了 `IAccountProvider` 接口，包含异步方法
- **双重实现**：
  - `LocalProvider`：使用本地文件存储（加密 JSON）
  - `RemoteProvider`：预留 API 调用模板，包含网络请求和错误重试逻辑
- **动态切换器**：`AccountManager` 作为全局入口，根据配置切换 Provider
- **数据迁移**：提供 `SyncToCloud()` 方法，支持本地数据推送到服务器
- **成熟方案**：单例模式 + JWT 结构

#### 使用示例

```typescript
import { AccountManager, StorageType } from './src/account/AccountManager';

// 初始化 AccountManager 为本地模式
const accountManager = AccountManager.getInstance({ storageType: StorageType.LOCAL });

// 登录
const authResult = await accountManager.authenticate('username', 'password');

// 获取用户数据
const userData = await accountManager.getUserData();

// 保存用户数据
userData.username = 'updateduser';
await accountManager.saveUserData(userData);

// 同步到云端
await accountManager.syncToCloud();

// 登出
accountManager.logout();
```

### 2. 道具系统 (Inventory System)

#### 核心功能
- **数据驱动设计**：道具属性配置在外部文件
- **背包管理**：槽位管理、叠加上限、交换位置
- **道具逻辑**：消耗/使用逻辑
- **组合模式**：处理不同类型道具的效果
- **事件通知**：当道具数量变化时，触发 `onInventoryChanged` 事件

#### 使用示例

```typescript
import { InventoryManager } from './src/inventory/InventoryManager';

// 初始化背包管理器
const inventoryManager = new InventoryManager();

// 监听背包变化事件
inventoryManager.onInventoryChanged = () => {
  console.log('Inventory changed!');
  // 刷新 UI
};

// 添加道具
inventoryManager.addItem('potion_health', 5);

// 移除道具
inventoryManager.removeItem('potion_health', 2);

// 交换道具位置
inventoryManager.swapItems(0, 1);

// 获取道具列表
const items = inventoryManager.getItems();
console.log('Inventory items:', items);
```

## 安装与使用

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
npm test
```

## 技术栈

- TypeScript
- Node.js
- ts-node (用于运行测试)

## 注意事项

1. **远程存储**：`RemoteProvider` 目前是一个模板实现，需要根据实际项目的 API 接口进行修改
2. **数据加密**：本地存储的 JSON 文件建议在实际项目中进行加密处理
3. **错误处理**：实际项目中应添加更完善的错误处理机制
4. **性能优化**：对于大型背包，可能需要考虑性能优化措施

## 扩展建议

1. **添加更多道具类型**：可以扩展 `ItemType` 枚举，添加更多道具类型
2. **实现道具效果系统**：可以为不同类型的道具实现具体的使用效果
3. **添加背包扩容功能**：可以实现背包槽位的动态扩容
4. **集成成就系统**：可以与账号系统集成，实现成就解锁功能
