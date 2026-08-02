它们之间**绝对不是冲突关系**，而是**核心引擎与上层封装**的依赖关系。

简单来说：`shiki` 是干活的“底层引擎”，而 `@shikijs/react`（或 `react-shiki`）是方便在 React 中调用的“方向盘”。

以下是它们的详细区别与联系：

### 1. `shiki`（核心引擎）
* **定位**：底层的代码语法高亮库。
* **职责**：负责加载 TextMate 语法、解析代码字符串、应用主题颜色，最终输出高亮后的 HTML 字符串或 AST 树。
* **特点**：它是**框架无关**的。无论是在 Node.js、Vue、Svelte 还是原生 HTML 中，你都可以用它。
* **用法**：需要你自己写异步代码去初始化高亮器（Highlighter），然后手动将生成的 HTML 注入到 DOM 中。

### 2. `@shikijs/react` / `react-shiki`（React 封装层）
* **定位**：专门为 React 开发者准备的 UI 组件/Hook 封装。
* **职责**：把 `shiki` 的异步初始化、状态管理、主题切换等复杂逻辑打包好，暴露出简单的 `<ShikiHighlighter />` 组件或 `useShikiHighlighter` Hook。
* **特点**：它**强依赖**于底层的 `shiki`。你在安装它时，它通常会自动把 `shiki` 作为依赖拉取下来。
* **优势**：你不需要关心 Highlighter 什么时候加载完、内存怎么管理，直接像写普通 React 组件一样传 `code` 和 `theme` 即可。

### 总结对比

| 维度 | `shiki` | `@shikijs/react` (或 `react-shiki`) |
| :--- | :--- | :--- |
| **角色** | 核心高亮引擎 | React 适配器/组件库 |
| **框架绑定** | 无（纯 JS/Node） | 强绑定 React |
| **使用方式** | `await codeToHtml(...)` 手动渲染 | `<ShikiHighlighter code={...} />` 声明式 |
| **依赖关系** | 独立存在 | 依赖 `shiki` |

### 💡 选型建议

* **如果你在 React 项目里**：直接用 `@shikijs/react` 或 `react-shiki`。它们帮你处理了 React 19 的并发渲染、服务端/客户端水合（Hydration）等麻烦事，开箱即用。
* **如果你在 Next.js / Astro 等 SSR 框架里**：很多时候你甚至不需要装 React 封装层，直接在构建时或服务端组件里调用 `shiki` 的 `codeToHtml`，把结果作为静态 HTML 返回即可，这样性能最好、体积最小。

---
你项目里现在用的是哪种 React 高亮库？我可以帮你评估下迁移到 shiki 的成本和步骤。
