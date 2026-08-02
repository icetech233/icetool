# CodeGraph

## 概要

本项目的 JWT 解码工具（JWT Parser）是一个基于 React 19 + TypeScript 的纯前端单页应用，
用于实时解析、解码并高亮展示 JWT（JSON Web Token）的 Header、Payload 与 Signature 三部分。
项目采用现代化构建工具链（Vite 8）与 Tailwind CSS v4，通过自定义 Hook 与展示组件分离关注点，
代码结构清晰、易于维护。UI 采用推特（X）风格的明/暗双主题，支持本地解析、数据不出浏览器。

## 技术栈

- **框架**：React 19（`react` / `react-dom`），函数组件 + Hooks。
- **构建工具**：Vite 8（`vite` + `@vitejs/plugin-react`），脚本见 `package.json`（`dev` / `build` / `preview` / `typecheck` / `lint`）。
- **样式方案**：Tailwind CSS v4（`@tailwindcss/postcss` + `tailwindcss`），采用 CSS-first 配置（无 `tailwind.config.ts`）。
- **语言**：TypeScript 7（`tsconfig.json`，`strict` + `noUnusedLocals` 等全开）。
- **动画**：`motion`（即 `framer-motion` 的新包名，`^12.43.0`），从 `motion/react` 导入；用于 `App`（标题/卡片入场 stagger）与 `JwtOutput`（状态切换 `AnimatePresence` + 解码卡片错落入场，错误态抖动）。
- **语法高亮**：`react-shiki`（`^0.11.0`）+ 按需加载的 Shiki 引擎（`@shikijs/langs/json`、`@shikijs/themes/github-light|dark`），用于解码后 JSON 的彩色展示。

## 文件结构与模块职责

```
jwtparse/
├── package.json            # 依赖与脚本
├── vite.config.ts          # Vite 构建配置（React 插件 + `@` 别名 + 手动拆包）
├── postcss.config.js       # PostCSS 配置（Tailwind v4）
├── tsconfig.json           # TypeScript 配置
├── index.html              # HTML 模板（含首绘前同步主题的内联脚本）
├── bun.lock                # Bun 依赖锁文件
└── src/
    ├── entry.tsx           # 应用入口，挂载 <App /> 到 DOM（StrictMode）
    ├── entry.css           # Tailwind 引入 + @theme 变量映射 + Shiki 双主题样式
    ├── global.css          # 全局样式：明/暗双主题 CSS 变量、滚动条、选中样式
    ├── vite-env.d.ts       # Vite 类型声明
    ├── App.tsx             # 主组件：布局容器 + 状态协调 + 入场动画
    ├── codegraph.md        # 本文档
    ├── components/
    │   ├── JwtInput.tsx    # JWT 输入组件（文本域 + 实时语法高亮叠层）
    │   ├── JwtOutput.tsx   # JWT 解码结果展示组件（懒加载，Shiki 高亮）
    │   ├── CopyButton.tsx  # 通用复制按钮（写剪贴板 + 复制反馈）
    │   └── HeaderRight.tsx # 页面右上角工具区（全屏 / 通知 / 用户 / 主题 / 设置）
    └── hooks/
        └── useJwt.ts       # JWT 解码核心逻辑 Hook
```

### 样式系统（Tailwind v4 CSS-first）

- `entry.css`：通过 `@import "tailwindcss"` 引入 Tailwind；
  `@custom-variant dark (&:is(.dark *))` 启用基于 `.dark` class 的 `dark:` 变体；
  `@theme inline` 块将 `global.css` 中定义的裸 HSL 通道变量（如 `--background: 200 10% 98%`）映射为 Tailwind 语义化工具类
  （`bg-background`、`text-foreground`、`border-border` 等），并保留 `bg-primary/20`、`ring-primary/50` 这类透明度修饰符支持；
  额外定义了 Shiki 双主题 `color/background-color` 规则（`.dark .shiki` 下切换到 `--shiki-dark` 变量）。
- `global.css`：在 `:root`（浅色）与 `.dark`（深色）中分别定义全部主题颜色变量，采用推特（X）风格：
  - 浅色：页面背景浅灰 `#f7f9f9`，卡片纯白，主色推特蓝 `#1d9bf0`（`--primary`），文本近黑 `#0f1419`。
  - 深色：近黑蓝灰页面背景，提亮后的推特蓝主色与绿色等，满足 WCAG 对比度要求。
  - JWT 高亮：Header 琥珀色、Payload 推特蓝、Signature 绿色（明暗两套取值，均满足对比度）。
  - 另含滚动条、选中文字等全局样式。

### 构建与拆包（vite.config.ts）

- `@` → `./src` 路径别名；`resolve.dedupe: ['react','react-dom']` 防止 motion 预构建时打入第二份 React 导致 hook 失效。
- `optimizeDeps.include: ['motion']` 预构建动画库。
- `build.rollupOptions.output.manualChunks` 将 `react/react-dom/scheduler`、`motion`、`shiki/@shikijs` 分别拆为独立 chunk，Shiki 体积大且由懒加载组件按需引入。

## 核心组件与数据流

### 1. `App.tsx`（主应用组件）

- **职责**：
  - 应用根组件与响应式布局容器（大屏左右分栏 `lg:flex-row`，小屏上下堆叠 `flex-col`）。
  - 通过 `useState` 维护核心状态 `jwtInput`（用户输入的 JWT 字符串）。
  - 调用 `useJwt(jwtInput)` 获取解码结果 `decoded`。
  - 使用 `motion` 的 `containerVariants` / `itemVariants` 实现标题与左右卡片的入场 stagger 弹簧动画。
  - `JwtOutput` 通过 `lazy()` + `Suspense` 懒加载（避免在首屏主包打入数百 kB 的 Shiki）。
- **数据流**：`App` → `JwtInput`（受控 value/onChange）/ `JwtOutput`（decoded）/ `HeaderRight`（独立状态）。

### 2. `useJwt.ts`（JWT 解码 Hook）

- **职责**：
  - 输入：JWT 字符串；输出：`{ header, payload, signature, error }`（均为 `string | null`）。
  - 通过 `useMemo` 在 `token` 变化时**同步派生**解码结果（单次渲染，无 `useEffect` 触发的冗余二次渲染）：
    - 空输入时返回全 `null` 空状态（等待输入提示）。
    - 按 `.` 拆分为 3 段，否则返回格式错误。
    - 对 Header、Payload 做 Base64Url 解码并 `JSON.parse` 后格式化（2 空格缩进）；解码使用 `TextDecoder('utf-8')` 配合 `Uint8Array`，正确还原中文等 UTF-8 多字节字符（旧实现 `atob` 直接转字符串会乱码）。
    - Signature 原样保留（不解密，仅展示）。
    - 任何异常（Base64/JSON 解析失败）返回统一的「解码失败」错误。
  - 纯逻辑，不依赖任何 UI 组件，可复用。
- **依赖**：仅 React 基础 Hook（`useMemo`）。

### 3. `JwtInput.tsx`（JWT 输入组件）

- **职责**：
  - 渲染 `<textarea>` 供用户输入；通过受控 `value` / `onChange` 与父组件 `App` 双向同步。
  - 叠放一个同步滚动的 `<div>` 高亮层：`renderHighlightedJWT` 将 JWT 按 `.` 拆分，分别对
    Header / Payload / Signature 着色（颜色取自 `--jwt-*` CSS 变量，通过 `text-[hsl(var(--jwt-...))]` 引用），分隔点 `.` 用前景色。
  - 文本域文字透明（`text-transparent` + 透明边框）、`caret-primary` 保留光标，可见字形由高亮层呈现；滚动通过 `handleScroll` 同步两者 `scrollTop/scrollLeft`，实现像素级对齐。

### 4. `JwtOutput.tsx`（JWT 输出组件，懒加载）

- **职责**：
  - 接收 `decoded` 作为 Props，按状态条件渲染（用 `AnimatePresence mode="wait"` 切换）：
    - **解码成功（success）**：分块展示 Header / Payload / Signature，每块带彩色语义标签
      （HEADER `bg-primary/20` / PAYLOAD `bg-secondary-foreground/20` / SIGNATURE `bg-accent-foreground/20`）与说明文字，并附 `CopyButton`。
      Header、Payload 经 Shiki 高亮（JSON + github-light/dark 双主题）；Signature 以等宽文字原样展示。
    - **解码失败（error）**：居中显示警告图标与错误信息（`text-destructive`），并附加抖动动画。
    - **初始状态（empty）**：居中显示锁图标与「等待输入...」提示。
  - Shiki 高亮器通过 `createHighlighterCore` + `createJavaScriptRegexEngine` 在 `useEffect` 中**按需加载** json 语言与 github 双主题（体积小、启动快），避免引入 >9MB 的全量 bundle；组件卸载时清理。
- **数据流**：`App` → `JwtOutput`（通过 `decoded` Prop）。

### 5. `CopyButton.tsx`（复制按钮）

- **职责**：通用按钮，接收 `value: string | null`；调用 `navigator.clipboard.writeText` 写入剪贴板，
  成功后 1.5s 内显示「✓ Copied」反馈，失败静默；卸载时清理定时器。`value` 为空时禁用。

### 6. `HeaderRight.tsx`（右上角工具区）

- **职责**：推特风格的圆形图标按钮组：
  - **全屏**：`requestFullscreen` / `exitFullscreen`，并监听 `fullscreenchange` 同步真实状态。
  - **通知**：装饰性铃铛（带红点），无逻辑。
  - **用户**：展示头像「明」与昵称「小明」。
  - **主题切换**：`toggleTheme` 在 `<html>` 上切换 `.dark` class 并写入 `localStorage.theme`（'dark'/'light'）。
    初始化时同步首绘前已由 `index.html` 内联脚本写入的 DOM 状态，避免二次闪烁；
    并在用户未手动指定主题（`localStorage` 无记录）时跟随系统 `prefers-color-scheme` 实时切换。
  - **设置**：装饰性齿轮按钮。

## 模块依赖关系图

```
[index.html] ──内联脚本──> 首绘前写入 <html class="dark">（防闪屏）
[index.html] ──加载──> [entry.tsx] ──挂载──> [App.tsx]

[App.tsx]  ── 导入  ──> [useJwt.ts]        (Hook，纯逻辑)
    │
    ├── 导入 ──> [JwtInput.tsx]     (展示组件，受控输入 + 高亮叠层)
    ├── lazy ──> [JwtOutput.tsx]    (展示组件，Shiki 高亮 + 状态动画)
    │                └── 导入 ──> [CopyButton.tsx]
    └── 导入 ──> [HeaderRight.tsx]  (独立状态：全屏 / 主题 / 等)

[global.css]  ──由──> [entry.css] 通过 @theme 映射为 Tailwind 工具类，被各组件 className 引用
```

- `App.tsx` 是中心协调者，持有唯一可变输入状态 `jwtInput`。
- `useJwt.ts` 封装全部解码业务逻辑，与 UI 解耦。
- `JwtInput.tsx`、`JwtOutput.tsx`、`CopyButton.tsx`、`HeaderRight.tsx` 为展示/交互组件，
  `JwtInput` 与 `HeaderRight` 不直接持有 JWT 状态，`JwtOutput` 仅消费 `decoded` Prop。
- 主题完全由 `global.css` 的 CSS 变量驱动（浅色 `:root` / 深色 `.dark`），组件仅使用语义化工具类
  （如 `bg-card`、`text-primary`、`bg-primary/20`），切换主题无需改动组件代码。

## 近期工程变更

- **构建工具升级**：Vite 7 → Vite 8；TypeScript 4.x → 7；动画库 `framer-motion` → 新包名 `motion`（从 `motion/react` 导入）。
- **语法高亮引擎替换**：原 Tailwind 着色输出改为 `react-shiki`（Shiki）+ 按需 JSON 语言与 github 双主题，
  解码结果 JSON 现在由 Shiki 彩色高亮，体积通过懒加载 + `manualChunks` 拆分控制。
- **解码逻辑重构**：`useJwt` 由 `useState` + `useEffect` 改为 `useMemo` 同步派生，去除 token 变化时的冗余渲染。
- **UTF-8 解码修复**：`base64UrlDecode` 改用 `Uint8Array` + `TextDecoder('utf-8')`，修复 `atob` 导致的中文/多字节乱码。
- **深色主题**：基于 `.dark` class 的明/暗双主题，由 `index.html` 内联脚本在首绘前同步应用（防 FOUC），
  `HeaderRight` 提供手动切换并持久化到 `localStorage`，未手动指定时跟随系统。
- **类型安全**：`tsconfig.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`、`forceConsistentCasingInFileNames`。
- **构建优化**：`vite.config.ts` 用 `manualChunks` 将 react / motion / shiki 拆为独立 chunk，Shiki 由 `JwtOutput` 懒加载。
- **高亮叠层稳健性**：`JwtInput` 用 `text-transparent`（跨浏览器隐藏真实文字）+ 透明边框 + `caret-primary`，与高亮层实现像素级对齐。
