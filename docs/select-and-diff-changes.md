# Select 下拉框组件与 Diff 页面改动说明

> 本次改动包含三部分：新增通用 `Select` 下拉框组件、Diff 页语言选择改用 Select、
> 修复 `DiffPage.tsx` 与 `ShikiEditor.tsx` 中发现的问题。

## 1. 新增组件：`src/components/base/Select.tsx`

通用的泛型下拉选择组件（值类型为字符串字面量联合），与项目现有的 `Tooltip`、
`SaveDiffHistoryPopover` 保持同一套实现约定。

### API

| Prop        | 类型                                  | 说明                                  |
| ----------- | ------------------------------------- | ------------------------------------- |
| `value`     | `T`                                   | 当前选中的值                          |
| `onChange`  | `(value: T) => void`                  | 选中变化回调                          |
| `options`   | `readonly SelectOption<T>[]`          | 选项列表（`{ value, label, disabled? }`） |
| `ariaLabel` | `string?`                             | 触发器与面板的无障碍标签              |
| `placeholder` | `string?`                           | 未选中时的占位文案，默认「请选择」    |
| `disabled`  | `boolean?`                            | 禁用整个下拉框                        |
| `className` | `string?`                             | 附加类名，作用于触发器按钮            |

### 实现要点

- **Portal 渲染**：下拉面板通过 `createPortal` 渲染到 `document.body`，
  以 `position: fixed` 锚定在触发器下方，避免被父容器 `overflow: hidden` / `transform` 裁剪。
- **自动翻转与夹取**：下方视口空间不足时翻转到触发器上方；水平方向做视口边界夹取；
  页面滚动 / 缩放时实时重新定位。
- **键盘交互**：`↑/↓` 移动高亮、`Home/End` 跳转首尾、`Enter/Space` 确认、`Esc` 关闭、
  `Tab` 关闭；高亮项自动 `scrollIntoView`。
- **ARIA 语义**：触发器 `aria-haspopup="listbox"` + `aria-expanded`，
  面板 `role="listbox"`，选项 `role="option"` + `aria-selected`，
  焦点始终保留在触发器上，通过 `aria-activedescendant` 暴露当前高亮项。
- **动画**：`motion/react` 的 `AnimatePresence` 做展开/收起过渡，方向随翻转自适应。
- 支持 `disabled` 选项（鼠标与键盘均跳过）；选中项带对勾图标。
- **选项配色**（专属 token，明暗两套，随 `.dark` 自动切换）：
  - 悬浮 / 键盘高亮：淡蓝底 + 深蓝字（暗色下为低饱和深蓝底 + 亮蓝字）；
  - 已选中：深蓝底 + 白字（暗色下为提亮蓝底 + 深字）；
  - token 定义于 `global.css`（`--select-hover` / `--select-selected` 等），
    在 `entry.css` 的 `@theme inline` 中注册为 `bg-select-hover`、`text-select-selected` 等工具类，
    命名与对比度约定同「交换 / 清空 / 折叠」按钮一致（文本对底色 >= 4.5:1）。

## 2. `DiffPage.tsx`：语言选择改用 Select

原先的 4 个 `OptionToggle` 按钮组（Markdown / TypeScript / Go / TSX）替换为：

```tsx
<Select
  value={language}
  onChange={setLanguage}
  options={LANGUAGES}
  ariaLabel="语法高亮语言"
/>
```

`LANGUAGES` 常量本身已是 `{ value, label }` 结构，直接复用；
`OptionToggle` 组件保留，继续服务于「忽略空白 / 忽略大小写」开关。

## 3. 发现的问题与修复

### DiffPage.tsx

| 问题 | 修复 |
| ---- | ---- |
| Shiki 高亮器在组件卸载时从不 `dispose()`，存在内存泄漏；若组件在高亮器加载完成前卸载，异步结果还会 setState 到已卸载组件 | effect 内记录实例引用，cleanup 时 `hl?.dispose()`；若加载完成时已卸载，则立即 `h.dispose()` |
| `React.ReactNode` 直接引用 UMD 全局命名空间，未显式导入 React | 改为 `import { ..., type ReactNode } from 'react'` |
| 两个 `<label>`（原始文本 / 对比文本）未与任何控件关联，无障碍语义缺失 | 通过 `htmlFor` + 新增的 `id` prop 与编辑器 textarea 关联 |

### ShikiEditor.tsx

| 问题 | 修复 |
| ---- | ---- |
| 滚动同步 `useLayoutEffect` 依赖缺少 `highlighter`：高亮器异步加载完成后高亮层重新渲染，`scrollTop/scrollLeft` 被重置为 0，而 textarea 仍保持原滚动位置，导致高亮文字与光标错位 | 将 `highlighter` 加入依赖，加载完成后重新对齐滚动 |
| 无法从外部关联 `<label>` | 新增可选 `id` prop，透传给 textarea |

## 4. 验证

- `tsc --noEmit` 全量类型检查通过（退出码 0）。
- 浏览器实测（`/diff` 路由）：
  - 下拉展开后 4 个选项渲染正常，当前项 `aria-selected="true"`，面板宽度与触发器对齐；
  - 点击「TypeScript」后面板收起、触发器文案更新为 TypeScript；
  - 控制台无任何报错；
  - label 关联生效后，两个编辑器在无障碍树中分别具有「原始文本」「对比文本」名称。

## 涉及文件

| 文件 | 变更 |
| ---- | ---- |
| `src/components/base/Select.tsx` | 新增 |
| `src/pages/DiffPage.tsx` | 语言选择改为 Select；高亮器销毁、ReactNode 导入、label 关联修复 |
| `src/components/base/ShikiEditor.tsx` | 新增 `id` prop；滚动同步依赖补全 |
