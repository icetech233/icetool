# 颜色实验室组件

`ColorLabPage` 的 UI 拆分。页面只做状态编排（持有 `useColorConverter`、收藏/历史的状态与刷新），具体的转换器、预览、历史/收藏/方案等交互面板放在这里。

## 目录结构

```
src/components/color/
├── ColorConverter.tsx   # 转换器面板：HEX/HEXA/RGB/RGBA/HSL/HSLA 多格式输入 + 滑块微调
├── ColorPreview.tsx     # 实时预览：大色块 + WCAG 对比度评级 + 点击复制 + 收藏
├── ColorSwatch.tsx      # 可复用单色块：点击回填、双击复制
├── ColorTrends.tsx      # 色彩趋势：基于本地历史的色相分布直方图（12 桶）
├── FavoritesPanel.tsx   # 收藏夹面板（右侧 Tab）：单色 / 配色方案
├── HistoryPanel.tsx     # 历史记录面板（右侧 Tab）：倒序展示，支持清空
├── InspirationWall.tsx  # 随机灵感墙：瀑布流配色卡片
├── QuickExamples.tsx    # 快捷工具栏「快速示例」Tab：精选调色板 + 随机灵感
├── SchemeRecommend.tsx  # 配色方案推荐：基于主色实时生成 5 种协调方案
├── StandardColors.tsx   # 快捷工具栏「标准色表」Tab：CSS 命名色 / Web 安全色
└── README.md
```

## 数据流

```
ColorLabPage
  ├─ converter = useColorConverter()        (useState + 派生)
  ├─ currentHex / favorites / history        (本地 IndexedDB)
  └─ ── ColorConverter / ColorPreview / 快捷工具栏 / 全宽区
```

- 单一数据源是 `converter`（`useColorConverter`）：任意格式输入变更会同步所有格式字段与滑块。
- `ColorPreview` 只读 `hexa`，并通过 `onFavorite` 回调通知页面收藏。
- 历史 / 收藏面板通过 `refreshKey`（数字自增）触发重新加载，避免轮询。
- `ColorSwatch` 是跨面板复用的原子组件：点击 `onPick` 回填主转换器，双击 `onCopy` 复制。

## 各组件职责

### `ColorConverter`
- 6 个格式输入框垂直排列（HEX / HEXA / RGB / RGBA / HSL / HSLA），每个带复制按钮。
- 滑块微调透明度 / 色相 H / 饱和度 S / 亮度 L，使用 `requestAnimationFrame` 节流，目标 60fps。
- 非法输入保留上次有效值，并以温和错误态提示（`error` 非空且 `lastEdited === field` 时高亮）。

### `ColorPreview`
- 大色块展示当前颜色，点击复制 HEXA 并弹出 Toast。
- 通过 `getContrastRating` 计算白底/黑底下的 WCAG 对比度，展示 AA / AAA 通过状态与比值。
- 支持一键收藏（`onFavorite`）。

### `SchemeRecommend` & `InspirationWall`
- 均复用 `convert.ts` 的 `generateHarmony` 与 `HARMONY_LABEL_MAP`。
- 支持 5 种协调方案：`complementary`（互补）、`analogous`（类似）、`triadic`（三角）、`splitComplementary`（分裂互补）、`monochromatic`（单色）。
- 每套方案可「应用首色」或「收藏整组」。

### `StandardColors`
- CSS 命名色（148 个）：支持按名称 / HEX 搜索过滤。
- Web 安全色（216 色）：网格展示，悬停放大，点击填充。

### `ColorTrends`
- 基于本地历史（`listHistory(200)`）统计色相分布直方图（12 桶）。
- 纯本地计算，无图表库依赖。

## 依赖的模块

- `src/utils/color/types.ts`：`ColorFormat`、`HarmonyType`、`HistoryItem`、`FavoriteItem` 等类型。
- `src/utils/color/convert.ts`：`generateHarmony` / `randomHex` / `getContrastRating` / `hueHistogram` 等纯函数。
- `src/utils/color/useColorConverter.ts`：`useColorConverter` Hook。
- `src/utils/color/data.ts`：`NAMED_COLORS` / `WEB_SAFE_COLORS` / `PALETTES`。
- `src/utils/storage/colorDB.ts`：`listHistory` / `clearHistory` / `listFavorites` / `removeFavorite` 等 IndexedDB 读写。
