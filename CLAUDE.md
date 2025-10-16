# DataEase Custom Chart - Claude AI Assistant Context

## 项目定位

**这是一个纯 Web 应用演示项目**,用于展示 BI 数据可视化功能。完成开发后将部署到 **Tencent EdgeOne Pages** 进行临时访问演示。

### 核心约束
- ✅ **纯前端应用** - 无后端服务,无数据库
- ✅ **静态部署** - 必须支持静态托管平台部署
- ✅ **边缘友好** - 优化资源加载,适配 CDN 边缘节点
- ✅ **离线可用** - 所有数据来自预置 JSON + localStorage
- ⚠️ **禁止网络请求** - 不得发起任何 API 调用或外部数据请求

---

## 技术栈

### 前端框架
- **React 18** - 使用函数式组件 + Hooks
- **TypeScript** - 严格类型检查
- **Vite** - 构建工具 (使用 rolldown-vite 7.1.12)
- **ECharts 6.x** - 图表渲染库

### 状态管理
- **localStorage** - 唯一的持久化存储方案
- **React Context/Hooks** - 组件状态管理

### 样式方案
- **CSS Modules** - 组件样式隔离
- **响应式设计** - 支持多种屏幕尺寸

---

## 项目结构

```
dataease_custom_chart/
├── CLAUDE.md                      # 本文件 - AI 助手上下文
├── README-CUSTOM-CHARTS.md        # 用户使用说明
├── prd.md                         # 完整需求文档
├── index.html                     # 主页面 (⚠️ 3.97MB - 需优化)
├── test-integration.html          # 集成测试页面
├── verify-setup.js                # 验证脚本
│
├── custom-charts/                 # Vite + React 项目 (核心开发目录)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── manage/            # 图表管理页面
│   │   │   └── editor/            # 图表编辑器页面
│   │   ├── shared/
│   │   │   └── storage.ts         # localStorage 封装
│   │   ├── components/            # 通用组件
│   │   └── styles/                # 全局样式
│   │
│   ├── dist/                      # 构建输出 (⚠️ 约 7.7MB)
│   │   ├── manage.html
│   │   ├── editor.html
│   │   └── assets/
│   │
│   ├── vite.config.ts             # Vite 配置
│   ├── package.json               # 依赖管理
│   └── tsconfig.json              # TypeScript 配置
│
└── custom-charts-static/          # 静态备份版本
```

---

## 开发命令

### 日常开发
```bash
# 启动开发服务器 (支持局域网访问)
npm --prefix custom-charts run dev -- --host

# 访问地址
# - 本地: http://localhost:5173
# - 局域网: http://YOUR_IP:5173
```

### 生产构建
```bash
# 构建生产版本 (必须在部署前执行)
npm --prefix custom-charts run build

# 输出目录: custom-charts/dist/
```

### 本地预览 (模拟生产环境)
```bash
# 方式 1: 使用 Python (推荐)
python3 -m http.server 8080 --bind 0.0.0.0

# 方式 2: 使用 Node.js serve
npm install -g serve
serve -l 8080 .

# 访问: http://localhost:8080/index.html
```

### 代码质量检查
```bash
# ESLint 检查
npm --prefix custom-charts run lint

# TypeScript 类型检查
cd custom-charts && npx tsc --noEmit
```

---

## 部署要求 (Tencent EdgeOne Pages)

### 🎯 核心目标
**所有开发任务必须确保最终产物可以直接部署到 EdgeOne Pages,减少二次优化成本。**

### 必须遵守的规则

#### 1. 资源优化
- ⚠️ **单文件大小限制** - HTML 文件不应超过 1MB
- ⚠️ **总体积控制** - 构建产物应尽量小于 5MB
- ✅ **资源分离** - 禁止将 CSS/JS 内联到 HTML (除非非常小)
- ✅ **启用压缩** - 所有文本资源应支持 gzip/brotli 压缩

#### 2. 路径配置
- ✅ **使用相对路径** - `base: './'` (已配置)
- ✅ **正确的资源引用** - 确保 `./assets/` 路径正确
- ⚠️ **避免绝对路径** - 不使用 `/path/to/resource` 形式

#### 3. 多页面应用配置
当前应用有多个入口页面:
- `manage.html` - 图表管理页面
- `editor.html` - 图表编辑器页面
- `index.html` - 主页面 (包含 iframe 加载上述页面)

部署时需要配置路由规则:
```yaml
# EdgeOne Pages 路由配置示例
/*           /index.html      200
/manage      /manage.html     200
/editor      /editor.html     200
```

#### 4. 跨域和安全
- ✅ **同源策略** - iframe 通信使用 PostMessage API
- ✅ **无外部依赖** - 所有资源应打包到部署产物中
- ⚠️ **CSP 兼容** - 避免使用 `eval()` 或内联脚本 (除非必要)

#### 5. 性能优化
- ✅ **代码分割** - 使用 dynamic import 懒加载
- ✅ **Tree Shaking** - 移除未使用的代码
- ✅ **资源预加载** - 关键资源使用 `<link rel="preload">`
- ✅ **缓存策略** - 静态资源应有合理的 cache-control

---

## 特殊功能实现

### 数据存储 (localStorage)
所有数据必须存储在浏览器 localStorage 中:

```typescript
// 存储键值规范
const STORAGE_KEYS = {
  DATASETS: 'bi_datasets',              // 数据集定义
  USER_QUERIES: 'bi_user_queries',      // 用户图表配置
  RECENT_DATASETS: 'bi_recent_datasets',// 最近访问记录
  UI_PREFERENCES: 'bi_ui_preferences',  // UI 偏好设置
  FIELD_CACHE: 'bi_field_cache',        // 字段元数据缓存
  QUERY_CACHE: 'bi_query_cache'         // 查询结果缓存
};
```

### iframe 通信机制
主页面 (`index.html`) 通过 iframe 加载子页面:

```javascript
// 父页面 -> 子页面通信
iframe.contentWindow.postMessage({ type: 'LOAD_CHART', id: '123' }, '*');

// 子页面 -> 父页面通信
window.parent.postMessage({ type: 'CHART_SAVED', data: {...} }, '*');
```

### 预置数据加载
应用启动时自动初始化演示数据:
- 广告数据集 (维度 + 指标字段)
- 示例图表配置
- 模拟查询结果

---

## 开发规范

### TypeScript
- ✅ 所有新代码必须使用 TypeScript
- ✅ 避免使用 `any`,优先使用具体类型或 `unknown`
- ✅ 为组件 Props 和 State 定义接口
- ✅ 使用严格模式 (`strict: true`)

### React 组件
- ✅ 优先使用函数式组件
- ✅ 使用 Hooks 管理状态和副作用
- ✅ 组件拆分遵循单一职责原则
- ✅ 避免不必要的重渲染 (使用 `memo`, `useMemo`, `useCallback`)

### 样式
- ✅ 使用 CSS Modules 避免样式冲突
- ✅ 遵循 BEM 命名规范 (可选)
- ✅ 响应式设计优先
- ⚠️ 避免内联样式 (除非动态计算)

### Git 提交
- ✅ 使用语义化提交信息 (feat/fix/refactor/docs)
- ✅ 每次提交保持原子性 (单一功能)
- ⚠️ 禁止提交 `node_modules/` 和 `.env` 文件

---

## 常见问题和解决方案

### Q1: 如何优化 index.html 的大小?
**问题**: 当前 `index.html` 有 3.97MB,可能包含内联资源。

**解决方案**:
1. 检查是否有 base64 内联的图片/字体
2. 将大型库改用 CDN 引用
3. 确保 CSS/JS 已提取为独立文件
4. 使用构建工具压缩 HTML

### Q2: 如何处理大数据量渲染?
**问题**: 图表数据量大时可能导致页面卡顿。

**解决方案**:
1. 使用虚拟滚动 (表格场景)
2. ECharts 开启数据采样 (`sampling: 'average'`)
3. 分页加载数据
4. 使用 Web Worker 处理数据计算

### Q3: 如何测试部署兼容性?
**步骤**:
1. 本地构建: `npm --prefix custom-charts run build`
2. 启动静态服务器: `python3 -m http.server 8080`
3. 测试所有页面和功能
4. 检查浏览器控制台是否有错误
5. 验证 localStorage 数据持久化

### Q4: 如何调试 iframe 通信?
```javascript
// 在浏览器控制台运行
window.addEventListener('message', (e) => {
  console.log('收到消息:', e.data);
});
```

---

## 性能基准

### 构建产物大小 (目标)
- `manage.html` - < 500KB
- `editor.html` - < 500KB
- `index.html` - < 1MB (⚠️ 当前 3.97MB,需优化)
- `assets/` 总计 - < 3MB

### 加载性能 (目标)
- First Contentful Paint (FCP) - < 1.5s
- Time to Interactive (TTI) - < 3s
- Largest Contentful Paint (LCP) - < 2.5s

### 运行时性能
- 图表渲染 - < 500ms (数据量 < 1000 行)
- localStorage 读写 - < 50ms
- 页面切换 - < 200ms

---

## AI 助手工作指南

### 优先级排序
1. **部署兼容性** - 所有代码变更必须考虑 EdgeOne Pages 部署
2. **性能优化** - 减小文件大小,优化加载速度
3. **功能完整性** - 确保核心功能正常工作
4. **代码质量** - 保持代码可维护性和可读性

### 代码变更检查清单
在提交代码前确认:
- [ ] TypeScript 类型检查通过
- [ ] ESLint 无警告和错误
- [ ] 构建成功 (`npm run build`)
- [ ] 本地预览功能正常
- [ ] 无新增外部网络请求
- [ ] localStorage 数据正常读写
- [ ] 构建产物大小未明显增加

### 禁止的操作
- ❌ 添加需要后端服务的功能
- ❌ 引入需要 Node.js 运行时的依赖
- ❌ 使用 Server-Side Rendering (SSR)
- ❌ 添加需要 WebSocket 或长连接的功能
- ❌ 使用依赖外部 API 的第三方服务
- ❌ 存储敏感信息到 localStorage (API keys 等)

### 推荐的工具和库
- ✅ ECharts - 图表库 (已使用)
- ✅ date-fns / dayjs - 日期处理 (轻量)
- ✅ lodash-es - 工具函数 (按需引入)
- ⚠️ 避免引入体积过大的库 (如 Moment.js, AntD 完整包)

---

## 测试和验证

### 手动测试清单
部署前必须验证以下功能:

1. **管理页面** (`manage.html`)
   - [ ] 图表列表展示正常
   - [ ] 搜索和筛选功能正常
   - [ ] 创建新图表按钮跳转正确
   - [ ] 编辑和删除操作正常

2. **编辑页面** (`editor.html`)
   - [ ] 数据集选择正常
   - [ ] 字段拖拽添加正常
   - [ ] 图表预览实时更新
   - [ ] 保存功能正常
   - [ ] 支持的图表类型 (柱状图/折线图/饼图/表格)

3. **主页面** (`index.html`)
   - [ ] iframe 加载子页面正常
   - [ ] 导航切换正常
   - [ ] 页面布局响应式正常

4. **数据持久化**
   - [ ] 创建图表后刷新页面数据仍存在
   - [ ] localStorage 数据结构正确
   - [ ] 无数据丢失或损坏

5. **跨浏览器兼容性**
   - [ ] Chrome/Edge (推荐)
   - [ ] Safari
   - [ ] Firefox

### 自动化验证
```bash
# 运行验证脚本
node verify-setup.js

# 在浏览器控制台运行
verifyCustomCharts.runAll()
```

---

## 部署流程

### 准备阶段
1. 清理和构建
   ```bash
   cd custom-charts
   rm -rf dist node_modules/.vite
   npm install
   npm run build
   ```

2. 检查构建产物
   ```bash
   ls -lh custom-charts/dist
   # 确认文件大小合理
   ```

3. 本地测试
   ```bash
   python3 -m http.server 8080
   # 访问并全面测试功能
   ```

### 部署到 EdgeOne Pages

#### 方式 1: 手动上传 (推荐首次)
1. 登录 EdgeOne Pages 控制台
2. 创建新站点
3. 上传 `custom-charts/dist/` 目录
4. 复制 `index.html` 到根目录 (如果需要)
5. 配置路由规则
6. 绑定自定义域名 (可选)

#### 方式 2: Git 集成 (推荐后续)
在 EdgeOne Pages 配置:
```yaml
构建命令: cd custom-charts && npm install && npm run build
输出目录: custom-charts/dist
根目录: /
Node 版本: 18.x
```

### 部署后验证
- [ ] 访问主页面正常
- [ ] 所有静态资源加载成功 (无 404)
- [ ] localStorage 功能正常
- [ ] 图表创建和编辑正常
- [ ] 性能指标达标 (使用 Chrome DevTools Lighthouse)

---

## 联系和支持

### 文档参考
- 项目需求: `prd.md`
- 使用说明: `README-CUSTOM-CHARTS.md`
- Vite 配置: `custom-charts/vite.config.ts`

### 关键文件
- 数据存储逻辑: `custom-charts/src/shared/storage.ts`
- 管理页面入口: `custom-charts/src/pages/manage/main.tsx`
- 编辑器入口: `custom-charts/src/pages/editor/main.tsx`

### 调试工具
```javascript
// 浏览器控制台可用的调试命令
window.openCustomCharts('manage')  // 打开管理页面
window.openCustomCharts('editor')  // 打开编辑页面
window.debugCustomCharts()         // 打印调试信息
verifyCustomCharts.runAll()        // 运行验证测试
```

---

## 版本历史

- **1.5** (当前分支) - 图表配置与预览模块集成
- 完成的功能:
  - ✅ 三栏布局编辑器
  - ✅ 数据集和字段选择
  - ✅ 查询构建器
  - ✅ 多种图表类型支持
  - ✅ localStorage 持久化

---

## 总结

**记住:这是一个演示项目,最终目标是部署到 Tencent EdgeOne Pages。所有开发决策都应优先考虑:**

1. 静态部署兼容性
2. 资源大小和加载性能
3. 离线可用性
4. 边缘节点友好

**在开发新功能或优化代码时,始终问自己:**
- 这会影响部署吗?
- 这会增加多少文件大小?
- 这需要后端服务吗?
- 这在边缘环境能正常工作吗?

保持简单,保持纯粹,保持可部署!
