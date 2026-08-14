# JSON 实验室组件

`JsonLabPage` 的 UI 拆分。页面只做状态编排，具体控制条、mode runner、输入输出面板放在这里。

## 目录结构

```
src/components/json/
├── animations.ts       # 页面/卡片/状态切换的 motion variants
├── CleanMode.tsx       # 清理模式的控制条 + runClean(input, options)
├── CompressMode.tsx    # 压缩转义模式的控制条 + runCompress(input, style)
├── FormatMode.tsx      # 格式化模式的控制条 + runFormat(input, indent)
├── ParseMode.tsx       # 在线解析模式的 runParse(input)
├── JsonInputPanel.tsx  # 左侧 JSON 文本输入框
├── JsonOutputPanel.tsx # 右侧结果面板（error / empty / success 三态）
├── JsonToolbar.tsx     # 顶部 mode tab + 交换 / 清空动作
├── JsonTreeView.tsx    # ★ JSON 语法高亮 + 折叠/展开树视图
├── ModeTab.tsx         # 分段切换按钮
├── types.ts            # Mode / ModeResult / DEFAULT_SAMPLE 等公共类型
└── README.md
```

## 数据流

```
JsonLabPage
  ├─ input, mode, options    (useState)
  ├─ result = useMemo(runX)  →  { output, error, report }
  └─ ── JsonToolbar / *Controls / JsonInputPanel / JsonOutputPanel
```

- 所有 mode runner 都返回统一的 [`ModeResult`](./types.ts) 结构。
- 出错时 `output = ''` 且 `error` 非空，页面据此推导 `state`。
- 成功态下，[JsonOutputPanel](./JsonOutputPanel.tsx) 内部会尝试 `JSON.parse(output)`：合法则渲染树视图，不合法（如 `escape` 模式的转义字面量）则回退到纯文本 `<pre>`。

## `JsonTreeView`

所有模式共用：只要 `output` 是合法 JSON，就用树视图呈现。

### 特性

- 键、字符串、数字、布尔、`null` 各自颜色区分，全部走主题色 token（`--primary` / `--accent` 等），自动适配深色模式。
- 对象 / 数组默认全部展开，点击标题行（含小三角）可折叠；折叠后显示 `{ N keys }` / `[ N items ]` 概要。
- 顶部按钮支持「全部展开 / 全部折叠」；空容器不参与，也不会显示三角。
- 顶部右侧提供全屏按钮，点击后通过 React Portal 撑满 `JsonLabPage` 容器（而非整个浏览器），全屏状态下按 `Esc` 退出。
- 使用节点路径（如 `$.foo[0].bar`）作为折叠状态 key，无需在数据上打标。
- 字符串会做 JSON 风格转义（`\n` / `\t` / `\"` / `\\`），保证长文本单行呈现。

### Props

```ts
interface JsonTreeViewProps {
  value: unknown; // JSON.parse 后的原始值
}
```

不做校验；上游 `runParse` 已保证是合法 JSON。传入 `undefined` 时上层组件不会渲染此视图。

### 扩展点

- 若后续需要「按节点复制路径 / 复制子树」等操作，在 `JsonNode` 里挂 hover 按钮即可，`path` 已经就位。
- 想接入 shiki / prism 之类的通用高亮，可参考现有的 `PrimitiveValue` 组件，改成生成 span + className 的形式。

## 新增一个 mode 的步骤

1. 在 [types.ts](./types.ts) 的 `MODES` 里追加一项，并扩展 `Mode` 联合类型。
2. 新建 `XxxMode.tsx`，导出：
   - `runXxx(input, options): ModeResult`
   - 若有可视化参数，再导出 `XxxControls` 组件与 `DEFAULT_XXX_STATE`。
3. 在 [`JsonLabPage`](../../pages/JsonLabPage.tsx) 的 `useMemo` switch 中接入 runner，并在控制条区域按 mode 渲染对应 Controls。
4. 只要 `output` 是合法 JSON，输出面板会自动切换到树视图，无需额外接线。
