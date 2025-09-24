# 巨量引擎BI工具复现需求分析文档

## 项目概述

**目标网页**: https://business.oceanengine.com/site/reporter-bp/pages/reporter-bp?aadvid=#/aeolus/charts

**项目目标**: 复现巨量引擎工作台中的BI图表创建工具，实现一个功能完整的数据分析和可视化平台

**技术约束**:
- 纯前端项目
- 数据存储使用浏览器localStorage
- 不发起任何网络请求；所有数据来源于预置静态JSON并通过localStorage持久化
- 功能需要真实实现，不能只是模拟
- 最终需要能在浏览器中直接演示

## 1. 布局结构分析

### 1.1 整体布局
- **三栏布局设计**：
  - 左侧面板：数据集和字段选择区域（宽度约300px）
  - 中间区域：图表配置和预览区域（自适应宽度）
  - 右侧面板：查询构建器区域（宽度约250px）

### 1.2 顶部工具栏
- 操作按钮组：撤销、重做、保存、另存为等
- 查询名称显示：显示当前查询的名称状态
- 功能分组：使用分隔符将不同功能区域分开

### 1.3 响应式设计要求
- 支持面板的折叠和展开
- 图表预览区域支持全屏显示
- 适配不同屏幕尺寸的布局调整

## 2. 视觉设计规范

### 2.1 颜色方案
- **主色调**: 蓝色系 (#3772FF)
- **背景色**: 白色主体，浅灰色分割区域 (#F5F5F5)
- **选中状态**: 蓝色高亮背景
- **边框颜色**: 浅灰色 (#E5E5E5)
- **文字颜色**: 深灰色 (#333333)，次要文字 (#666666)

### 2.2 字体和图标
- **中文字体**: 系统默认字体栈 (PingFang SC, Microsoft YaHei, sans-serif)
- **字体大小**: 主要文字14px，次要文字12px，标题16px
- **图标系统**: 统一的SVG图标，16px标准尺寸
- **图标风格**: 线性图标，简洁现代

### 2.3 间距和布局
- **基础间距单位**: 4px的倍数 (4px, 8px, 12px, 16px, 24px)
- **卡片设计**: 圆角4px，阴影 box-shadow: 0 2px 8px rgba(0,0,0,0.1)
- **列表项高度**: 32px标准行高
- **面板内边距**: 16px

### 2.4 交互状态
- **悬停效果**: 背景色变为 #F0F0F0
- **选中状态**: 蓝色边框 2px solid #3772FF
- **禁用状态**: 透明度50%，灰色文字
- **加载状态**: 旋转动画，蓝色主题

## 3. 核心功能模块

### 3.1 数据集选择器
**功能描述**: 允许用户选择不同的数据源进行分析

**具体需求**:
- 下拉选择器显示可用数据集列表
- 显示数据集名称和简要描述
- 支持搜索功能快速定位数据集
- 记录最近访问的数据集，提供快速选择

**技术实现**:
```typescript
interface Dataset {
  id: string;
  name: string;
  description: string;
  fields: Field[];
  lastModified: Date;
  category: string;
}
```

### 3.2 字段选择面板
**功能描述**: 展示数据集中可用的维度和指标字段

**具体需求**:
- **维度字段区域**: 显示所有可用的维度字段（如日期、广告主名称等）
- **指标字段区域**: 显示所有可用的指标字段（如展示数、点击数等）
- **搜索功能**: 支持字段名称的模糊搜索
- **字段详情**: 鼠标悬停显示字段的详细信息
- **字段操作**: 点击字段添加到查询构建器

**字段数据模型**:
```typescript
interface Field {
  id: string;
  name: string;
  displayName: string;
  type: 'dimension' | 'metric';
  dataType: 'string' | 'number' | 'date' | 'boolean';
  expression: string;
  description: string;
  category: string;
}
```

### 3.3 查询构建器
**功能描述**: 构建和管理数据查询的核心组件

**具体需求**:
- **维度区域**: 
  - 显示已选择的维度字段
  - 支持字段的重新排序
  - 支持字段的移除操作
  
- **指标区域**:
  - 显示已选择的指标字段
  - 支持聚合函数选择（Sum、Count、Avg、Max、Min）
  - 支持指标的格式化设置
  
- **筛选器区域**:
  - 添加和管理筛选条件
  - 支持多种筛选类型：日期范围、数值范围、文本匹配、列表选择
  - 支持筛选条件的逻辑组合（AND/OR）

**查询模型**:
```typescript
interface Query {
  id: string;
  name: string;
  dataset: string;
  dimensions: QueryField[];
  metrics: QueryField[];
  filters: Filter[];
  chartType: string;
  config: ChartConfig;
  createdAt: Date;
  updatedAt: Date;
}

interface QueryField {
  field: Field;
  aggregation?: 'sum' | 'count' | 'avg' | 'max' | 'min';
  format?: string;
  alias?: string;
}
```

## 4. 图表配置系统

### 4.1 图表类型选择器
**支持的图表类型**:
- **表格**: 用于显示详细的数据列表
- **柱状图**: 用于比较不同类别的数值
- **折线图**: 用于显示数据的趋势变化
- **饼图**: 用于显示数据的占比关系
- **散点图**: 用于显示两个变量之间的相关性
- **热力图**: 用于显示数据的密度分布
- **面积图**: 用于显示数据的累积效果
- **雷达图**: 用于多维度数据的对比

### 4.2 图表配置选项
**表格配置**:
- Default Format: 默认格式设置
- Pagination: 分页配置
- Text Alignment: 文本对齐方式
- Table Style: 表格样式主题
- Grid: 网格线显示设置
- Sparklines: 迷你图表嵌入
- Special Value: 特殊值处理规则
- Custom Fields: 自定义计算字段

**图表通用配置**:
- 颜色主题设置
- 图例位置和样式
- 坐标轴配置
- 数据标签显示
- 动画效果设置

## 5. 基础分析与查询（纯前端）

### 5.1 基础分析工具（前端计算）
- **Sort**: 前端对当前结果集进行排序
- **Top N**: 前端取前N名（或后N名）
- **Summation**: 前端聚合求和/计数/平均/最大/最小
- **Percentage**: 基于当前分组结果的占比/百分比（前端计算）

> 以上功能全部在浏览器本地执行，不依赖任何服务端能力。

### 5.2 查询执行（本地）
- **Query按钮**：在前端对静态JSON + localStorage数据进行筛选、分组、聚合与排序
- **Auto Query**：可选本地自动执行（带防抖）
- **状态提示**：就绪 / 执行中 / 完成（不展示服务端性能指标）
- **可选**：显示本地计算耗时（仅用于前端性能评估）

### 5.3 不纳入本演示范围的高级功能（已删除）
- **Comparison**、**Period-on-period**、**Table Calculation**：涉及多步/跨查询复杂计算
- **Clustering**、**Forecast**：需要模型或服务端支持
- 如需后续扩展，可基于当前本地查询引擎迭代

## 6. 技术实现建议

### 6.1 技术栈选择
- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand（或 React Context/Jotai），不使用服务端状态库
- **UI组件库**: Ant Design + 自定义组件
- **图表库**: Apache ECharts
- **拖拽功能**: @dnd-kit/core
- **样式方案**: CSS Modules + Tailwind CSS
- **数据来源**: 预置静态JSON + localStorage（不发起任何网络请求）

### 6.2 项目结构
```text
src/
├── components/          # 通用组件
├── pages/               # 页面组件
├── hooks/               # 自定义Hooks
├── stores/              # 状态管理（Zustand）
├── data/                # 预置静态JSON数据与生成脚本
├── storage/             # localStorage封装工具
├── types/               # TypeScript类型定义
├── utils/               # 工具函数（过滤/分组/聚合）
├── constants/           # 常量定义
└── assets/              # 静态资源
```

### 6.3 数据存储方案
**localStorage存储结构**:
```javascript
const STORAGE_KEYS = {
  DATASETS: 'bi_datasets',           // 数据集列表
  USER_QUERIES: 'bi_user_queries',   // 用户查询历史
  RECENT_DATASETS: 'bi_recent_datasets', // 最近访问数据集
  UI_PREFERENCES: 'bi_ui_preferences',   // 界面偏好设置
  FIELD_CACHE: 'bi_field_cache',     // 字段元数据缓存
  QUERY_CACHE: 'bi_query_cache'      // 查询结果缓存
};
```

## 7. 开发实施计划（纯前端）

### 7.1 阶段一：基础框架与数据准备（1周）
- [ ] 项目初始化（Vite + React + TS）
- [ ] 三栏布局与顶部工具栏
- [ ] 预置静态JSON数据与初始化脚本（写入localStorage）
- [ ] 基础组件（按钮、输入、选择、面板）

### 7.2 阶段二：核心功能（1-2周）
- [ ] 数据集选择器（读取本地JSON/localStorage）
- [ ] 字段面板（维度与指标、搜索、悬停提示）
- [ ] 拖拽交互（字段添加/移除/排序）
- [ ] 查询构建器（前端筛选/分组/聚合/排序）
- [ ] 表格、柱状图、折线图展示

### 7.3 阶段三：配置与持久化（1周）
- [ ] 图表配置面板（基础通用配置）
- [ ] 简单分析功能（Sort/Top N/Summation/Percentage）
- [ ] 查询与配置的localStorage持久化

### 7.4 阶段四：完善与优化（1周）
- [ ] 全屏与导出（前端导出PNG/CSV）
- [ ] 列表虚拟滚动、防抖与分页
- [ ] 关键路径单元测试与E2E冒烟
- [ ] 性能优化与可用性打磨

## 8. 关键技术难点

### 8.1 复杂拖拽交互
**挑战**: 实现字段从左侧面板拖拽到查询构建器的流畅交互
**解决方案**: 使用@dnd-kit库，实现可访问性友好的拖拽功能

### 8.2 动态图表渲染
**挑战**: 根据不同的数据类型和配置动态生成合适的图表
**解决方案**: 基于ECharts封装图表组件，建立数据到图表配置的映射规则

### 8.3 查询构建器逻辑（前端）
**挑战**: 在前端对数组进行筛选、分组、聚合且保持清晰可维护
**解决方案**: 采用轻量查询描述结构（对象/数组），用纯函数实现 filter/map/reduce/groupBy，本地执行；避免AST与多级嵌套

### 8.4 大数据量性能优化
**挑战**: 处理大量字段和数据时保持界面响应性
**解决方案**: 虚拟滚动、分页加载、数据缓存、防抖查询等优化策略

## 9. 测试策略

### 9.1 单元测试
- 核心业务逻辑函数测试
- 数据处理和转换函数测试
- 工具函数和常量测试

### 9.2 集成测试
- 组件间交互测试
- 数据流测试
- 状态管理测试

### 9.3 端到端测试
- 完整用户操作流程测试
- 跨浏览器兼容性测试
- 性能基准测试

## 10. 总结

本需求分析文档详细描述了巨量引擎BI工具的所有核心功能和技术实现要求。通过分阶段的开发计划，可以逐步构建出一个功能完整、用户体验优秀的数据分析和可视化平台。

**项目成功的关键因素**:
1. 严格按照原网页的交互逻辑实现功能
2. 注重用户体验和界面响应性
3. 建立完善的数据模型和状态管理
4. 基于本地静态JSON + localStorage 的真实计算与图表渲染（不发起网络请求）
5. 保证代码质量和可维护性

通过本文档的指导，开发团队可以高效地完成项目的复现工作，并确保最终产品能够满足演示和使用需求。

## 附录A：模拟数据结构

### A.1 广告基础数据集字段定义

**维度字段 (Dimensions)**:
```javascript
const DIMENSION_FIELDS = [
  { id: 'date', name: '日期', dataType: 'date', description: '广告投放日期' },
  { id: 'advertiser_name', name: '广告主名称', dataType: 'string', description: '广告主账户名称' },
  { id: 'agent_id', name: '代理商ID', dataType: 'string', description: '代理商唯一标识' },
  { id: 'agent_name', name: '代理商名称', dataType: 'string', description: '代理商名称' },
  { id: 'account_id', name: '广告账户ID', dataType: 'string', description: '广告账户唯一标识' },
  { id: 'campaign_category', name: '广告组类别', dataType: 'string', description: '广告组分类' },
  { id: 'campaign_id', name: '广告组id', dataType: 'string', description: '广告组唯一标识' },
  { id: 'promotion_type', name: '推广类型', dataType: 'string', description: '推广方式类型' },
  { id: 'campaign_budget', name: '组预算', dataType: 'number', description: '广告组预算金额' },
  { id: 'ad_name', name: '计划名称', dataType: 'string', description: '广告计划名称' },
  { id: 'ad_budget', name: '计划预算', dataType: 'number', description: '广告计划预算' },
  { id: 'ad_id', name: '广告计划id', dataType: 'string', description: '广告计划唯一标识' },
  { id: 'bid_price', name: '出价', dataType: 'number', description: '广告出价金额' },
  { id: 'deep_bid_price', name: '深度出价', dataType: 'number', description: '深度转化出价' },
  { id: 'billing_type', name: '计费类型', dataType: 'string', description: '广告计费方式' },
  { id: 'download_url', name: '下载链接', dataType: 'string', description: '应用下载链接' },
  { id: 'deep_conversion_target', name: '深度转化目标', dataType: 'string', description: '深度转化目标类型' },
  { id: 'delivery_range', name: '投放范围', dataType: 'string', description: '广告投放地域范围' },
  { id: 'conversion_target', name: '转化目标', dataType: 'string', description: '转化目标类型' },
  { id: 'delivery_speed', name: '投放速度', dataType: 'string', description: '广告投放速度设置' },
  { id: 'landing_page_url', name: '落地页链接', dataType: 'string', description: '广告落地页URL' }
];
```

**指标字段 (Metrics)**:
```javascript
const METRIC_FIELDS = [
  { id: 'activations', name: '激活数', dataType: 'number', description: '应用激活次数', aggregation: 'sum' },
  { id: 'activation_cost', name: '激活成本', dataType: 'number', description: '单次激活成本', aggregation: 'avg' },
  { id: 'impressions', name: '展示数', dataType: 'number', description: '广告展示次数', aggregation: 'sum' },
  { id: 'clicks', name: '点击数', dataType: 'number', description: '广告点击次数', aggregation: 'sum' },
  { id: 'cost', name: '消耗', dataType: 'number', description: '广告消耗金额', aggregation: 'sum' },
  { id: 'conversions', name: '转化数', dataType: 'number', description: '转化次数', aggregation: 'sum' },
  { id: 'first_payments', name: '首次付费数', dataType: 'number', description: '首次付费用户数', aggregation: 'sum' },
  { id: 'first_payment_cost', name: '首次付费成本', dataType: 'number', description: '首次付费成本', aggregation: 'avg' },
  { id: 'first_payment_rate', name: '首次付费率(%)', dataType: 'number', description: '首次付费转化率', aggregation: 'avg' },
  { id: 'activation_rate', name: '激活率(%)', dataType: 'number', description: '激活转化率', aggregation: 'avg' },
  { id: 'registrations', name: '注册数', dataType: 'number', description: '用户注册数量', aggregation: 'sum' },
  { id: 'registration_cost', name: '注册成本', dataType: 'number', description: '单次注册成本', aggregation: 'avg' },
  { id: 'registration_rate', name: '注册率(%)', dataType: 'number', description: '注册转化率', aggregation: 'avg' },
  { id: 'identity_verifications', name: '通过身份认证数', dataType: 'number', description: '身份认证通过数', aggregation: 'sum' },
  { id: 'attachment_clicks', name: '附加素材卡片点击数', dataType: 'number', description: '附加素材点击次数', aggregation: 'sum' },
  { id: 'attachment_impressions', name: '附加素材卡片展示数', dataType: 'number', description: '附加素材展示次数', aggregation: 'sum' },
  { id: 'avg_play_duration', name: '平均单次播放时长', dataType: 'number', description: '视频平均播放时长', aggregation: 'avg' },
  { id: 'button_clicks', name: '按钮button', dataType: 'number', description: '按钮点击次数', aggregation: 'sum' },
  { id: 'card_3s_impressions', name: '3秒卡片展现数', dataType: 'number', description: '3秒卡片展现次数', aggregation: 'sum' },
  { id: 'phone_button_clicks', name: '附加创意电话按钮点击', dataType: 'number', description: '电话按钮点击次数', aggregation: 'sum' }
];
```

### A.2 示例查询数据
```javascript
const SAMPLE_QUERY_DATA = [
  {
    date: '2025-09-23',
    impressions: 125430,
    clicks: 3421,
    cost: 2156.78,
    conversions: 89,
    ctr: 2.73,
    cpc: 0.63,
    conversion_rate: 2.60
  },
  {
    date: '2025-09-22',
    impressions: 118920,
    clicks: 3156,
    cost: 1987.45,
    conversions: 76,
    ctr: 2.65,
    cpc: 0.63,
    conversion_rate: 2.41
  }
  // ... 更多示例数据
];
```

## 附录B：组件API设计

### B.1 核心组件接口

**ChartBuilder 主组件**:
```typescript
interface ChartBuilderProps {
  initialQuery?: Query;
  onQueryChange?: (query: Query) => void;
  onSave?: (query: Query) => void;
  readonly?: boolean;
}
```

**FieldPanel 字段面板**:
```typescript
interface FieldPanelProps {
  dataset: Dataset;
  onFieldSelect: (field: Field) => void;
  selectedFields: Field[];
  searchable?: boolean;
  collapsible?: boolean;
}
```
```

**ChartPreview 图表预览**:
```typescript
interface ChartPreviewProps {
  data: any[];
  chartType: string;
  config: ChartConfig;
  loading?: boolean;
  error?: string;
  onConfigChange?: (config: ChartConfig) => void;
}
```

### B.2 本地数据API（无网络）

```typescript
// 数据加载与初始化（读取预置静态JSON或内置常量，并写入 localStorage）
function loadPresetDatasets(): Dataset[]
function initLocalStorage(presets: Dataset[]): void

// 本地数据读取
function getLocalDatasets(): Dataset[]
function getLocalDatasetFields(datasetId: string): Field[]

// 本地查询执行（数组筛选/分组/聚合/排序，纯前端）
function runLocalQuery(query: Query, rows: any[]): QueryResult

// 本地持久化
function saveQueryToLocal(query: Query): void
function getQueryHistoryFromLocal(): Query[]

// 轻量存储封装（localStorage）
const storage = {
  save<T>(key: string, data: T): void,
  load<T>(key: string): T | null,
  remove(key: string): void,
  clear(): void,
  keys(): string[],
}
```

## 附录C：样式规范（和当前网页模板保持一致）

### C.1 CSS变量定义
```css
:root {
  /* 颜色系统 */
  --primary-color: #3772FF;
  --primary-hover: #2563EB;
  --primary-active: #1D4ED8;

  --background-primary: #FFFFFF;
  --background-secondary: #F5F5F5;
  --background-tertiary: #FAFAFA;

  --text-primary: #333333;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-disabled: #CCCCCC;

  --border-color: #E5E5E5;
  --border-hover: #D1D5DB;
  --border-focus: #3772FF;

  /* 间距系统 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;

  /* 字体系统 */
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;

  /* 阴影系统 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-base: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.15);

  /* 圆角系统 */
  --radius-sm: 2px;
  --radius-base: 4px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

### C.2 组件样式类
```css
/* 面板样式 */
.panel {
  background: var(--background-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-base);
  box-shadow: var(--shadow-sm);
}

.panel-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  font-weight: 500;
  color: var(--text-primary);
}

.panel-content {
  padding: var(--spacing-lg);
}

/* 字段项样式 */
.field-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.field-item:hover {
  background-color: var(--background-secondary);
}

.field-item.selected {
  background-color: rgba(55, 114, 255, 0.1);
  border: 1px solid var(--primary-color);
}

.field-icon {
  width: 16px;
  height: 16px;
  margin-right: var(--spacing-sm);
  color: var(--text-secondary);
}

.field-name {
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-base);
  background: var(--background-primary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  border-color: var(--border-hover);
  background: var(--background-secondary);
}

.btn-primary {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## 附录D：开发环境配置

### D.1 项目初始化
```bash
# 创建项目
npm create vite@latest bi-chart-builder -- --template react-ts

# 安装依赖
npm install

# 安装额外依赖
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install echarts echarts-for-react
npm install antd @ant-design/icons
npm install zustand
npm install clsx tailwindcss
npm install @types/node
```

### D.2 Vite配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### D.3 TypeScript配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

通过以上详细的需求分析和技术指导完成当前纯 web 应用开发
