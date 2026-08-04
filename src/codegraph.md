# CodeGraph

## 概要

本项目的 JWT 解码工具（JWT Parser）是一个基于 React 19 + TypeScript 的纯前端单页应用，
用于实时解析、解码并高亮展示 JWT（JSON Web Token）的 Header、Payload 与 Signature 三部分。
项目采用现代化构建工具链（Vite 8）与 Tailwind CSS v4，通过自定义 Hook 与展示组件分离关注点，
代码结构清晰、易于维护。UI 采用推特（X）风格的明/暗双主题，支持本地解析、数据不出浏览器。

项目已从单页布局改造为**路由驱动的多页应用架构**：引入 `react-router-dom` 路由层，
`App.tsx` 退化为布局壳（`Sidebar` + `HeaderRight` + `<Outlet />`），
原 JWT 功能抽离为独立页面 `JwtDecodePage`，后续新增功能只需追加路由与页面组件。

## 技术栈

- **框架**：React 19（`react` / `react-dom`），函数组件 + Hooks。
- **构建工具**：Vite 8（`vite` + `@vitejs/plugin-react`），脚本见 `package.json`（`dev` / `build` / `preview` / `typecheck` / `lint`）。
- **样式方案**：Tailwind CSS v4（`@tailwindcss/postcss` + `tailwindcss`），采用 CSS-first 配置（无 `tailwind.config.ts`）。
- **语言**：TypeScript 7（`tsconfig.json`，`strict` + `noUnusedLocals` 等全开）。
- **路由**：`react-router-dom`（`^7.18`），`createBrowserRouter` + `RouterProvider`，路由表位于 `router.tsx`，`/` 根路由挂载布局壳，子路由懒加载各功能页面。
- **动画**：`motion`（即 `framer-motion` 的新包名，`^12.43.0`），从 `motion/react` 导入；用于 `App`（标题/卡片入场 stagger）与 `JwtOutput`（状态切换 `AnimatePresence` + 解码卡片错落入场，错误态抖动），以及 `Sidebar` 菜单项入场动画。
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
    ├── entry.tsx           # 应用入口，挂载 <RouterProvider router={router} /> 到 DOM（StrictMode）
    ├── entry.css           # Tailwind 引入 + @theme 变量映射 + Shiki 双主题样式
    ├── global.css          # 全局样式：明/暗双主题 CSS 变量、滚动条、选中样式
    ├── vite-env.d.ts       # Vite 类型声明
    ├── App.tsx             # 布局壳：Sidebar + 顶部 HeaderRight + <Outlet />（Suspense 兜底）
    ├── router.tsx          # 路由表定义（/ → /jwt 重定向，/jwt /base64 /url 子路由）
    ├── codegraph.md        # 本文档
    ├── components/
    │   ├── Sidebar.tsx     # 左侧菜单栏（桌面固定 w-56，移动端折叠为汉堡菜单 + 下拉）
    │   ├── JwtInput.tsx    # JWT 输入组件（文本域 + 实时语法高亮叠层）
    │   ├── JwtOutput.tsx   # JWT 解码结果展示组件（懒加载，Shiki 高亮）
    │   ├── CodecView.tsx   # 通用「编解码」双栏视图（编/解模式 + 变体切换 + 三态动画，供 Base64/URL 复用）
    │   ├── CopyButton.tsx  # 通用复制按钮（写剪贴板 + 复制反馈）
    │   └── HeaderRight.tsx # 页面右上角工具区（全屏 / 通知 / 用户 / 主题 / 设置）
    ├── pages/
    │   ├── JwtDecodePage.tsx  # JWT 解码功能页（从原 App.tsx 抽出，保留 useJwt + JwtInput/JwtOutput）
    │   ├── Base64Page.tsx     # Base64 编解码功能页（注入 encode/decode + URL-safe 变体）
    │   └── UrlCodecPage.tsx   # URL 编解码功能页（注入 encode/decode + Component/URI 变体）
    ├── hooks/
    │   └── useJwt.ts          # JWT 解码核心逻辑 Hook
    └── utils/
        ├── base64.ts          # UTF-8 安全的 Base64 编解码（含 URL-safe 变体、错误分类）
        └── urlCodec.ts        # URL 编解码（Component / URI 两种粒度）
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

### 1. `App.tsx`（应用布局壳）

- **职责**：
  - 应用根布局组件：`Sidebar`（左侧菜单）+ 顶部 `HeaderRight`（右上角工具区）+ `<Outlet />`（路由内容出口）。
  - 不再持有任何业务状态（`jwtInput` 等已下放到 `JwtDecodePage`），仅负责页面结构编排。
  - 外层包裹 `<Suspense>` 兜底路由懒加载的 loading 状态。

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
    Header / Payload / Signature 着色（颜色取自 `--jwt-*`（如 `--jwt-header`）CSS 变量，通过 `text-[hsl(var(--jwt-header))]` 这类任意值类名引用），分隔点 `.` 用前景色。
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

### 7. `Sidebar.tsx`（左侧菜单栏）

- **职责**：
  - 桌面端固定宽度 `w-56` 侧边栏，带品牌标识「JWT Tools」；移动端折叠为顶部条 + 汉堡按钮，点击展开下拉菜单。
  - 菜单项由 `menuItems` 数组配置（`{ path, label, icon }`），后续新增功能只需追加一项。
  - 使用 `NavLink` 自动根据当前路由高亮激活项（`isActive` 切换 `bg-muted text-foreground`）。
  - 菜单项入场使用 `motion` 的 stagger 动画（`listVariants` / `itemVariants`）。
  - 复用现有 CSS 变量（`bg-card`、`text-muted-foreground`、`ring-ring` 等），自动适配明暗主题。

### 8. `router.tsx`（路由表）

- **职责**：
  - 使用 `createBrowserRouter` 定义路由：`/` 根路径挂载 `App` 布局壳，子路由通过 `<Outlet />` 渲染。
  - 根路径 `/` 与 404 通配 `*` 均重定向到 `/jwt`。
  - 每个功能页面通过 `lazy()` 懒加载，配合 `App.tsx` 的 `<Suspense>` 边界，实现代码分包。

### 9. `JwtDecodePage.tsx`（JWT 解码功能页）

- **职责**：
  - 从原 `App.tsx` 抽出，持有 `jwtInput` 状态，调用 `useJwt` Hook，协调 `JwtInput` / `JwtOutput` 的渲染。
  - 保留 `containerVariants` / `itemVariants` 入场 stagger 动画。
  - `JwtOutput` 仍通过 `lazy()` 懒加载，避免将 Shiki 打入功能页主包。

### 10. `CodecView.tsx`（通用编解码视图）

- **职责**：
  - 供 Base64、URL 等文本级编解码工具复用的双栏视图。调用方注入 `encode(input, variant)` / `decode(input, variant)` 两个纯函数（错误情况直接抛异常，由视图统一捕获展示），以及可选的 `variants` 描述子模式。
  - 顶部工具条：`编码 / 解码` 模式切换、变体切换（可选）、清空输入、`交换`（把当前输出灌回输入并翻转方向）。
  - 左列：受控 `<textarea>`；右列：结果展示区，按 `error / empty / success` 三态 `AnimatePresence` 切换，错误态含抖动，成功态附 `CopyButton` 与长度提示。
  - 结果由 `useMemo(direction, encode, decode, input, variant)` 同步派生，与 `useJwt` 思路一致，无冗余渲染。

### 11. `Base64Page.tsx` / `UrlCodecPage.tsx`（编解码功能页）

- **`Base64Page`**：包装 `CodecView`，注入 `utils/base64.ts` 的 `encodeBase64` / `decodeBase64`，暴露「标准 / URL-safe」两种变体（解码时自动兼容两种字符集，无需区分）。
- **`UrlCodecPage`**：包装 `CodecView`，注入 `utils/urlCodec.ts` 的 `encodeUrl` / `decodeUrl`，暴露「Component / URI」两种粒度（分别对应 `encodeURIComponent` 与 `encodeURI`）。
- 两个页面都通过 `router.tsx` 中的 `lazy()` 懒加载，控制主包体积。

### 12. `utils/base64.ts` / `utils/urlCodec.ts`（编解码工具函数）

- **`base64.ts`**：`encodeBase64(text, urlSafe?)` 以 `TextEncoder` 得到 UTF-8 字节后走 `btoa`，可选输出 URL-safe 变体（`-` `_` 替换 `+` `/`，去除末尾 `=`）；`decodeBase64(input)` 去空白、把 URL-safe 字符集归一化回标准字符集、按 4 字节自动补 `=`，对字符集与结构、UTF-8 三类错误分别抛出可读消息。
- **`urlCodec.ts`**：`encodeUrl(text, mode)` / `decodeUrl(text, mode)`，`mode` 为 `'component' | 'uri'`；解码遇到损坏的百分号转义时抛出可读错误。

## 模块依赖关系图

```
[index.html] ──内联脚本──> 首绘前写入 <html class="dark">（防闪屏）
[index.html] ──加载──> [entry.tsx] ──挂载──> [RouterProvider → router.tsx]

[router.tsx] ──createBrowserRouter──> [App.tsx]  (布局壳)
    │
    ├── / ──重定向──> /jwt
    ├── /jwt ──lazy──> [JwtDecodePage.tsx]
    ├── /base64 ──lazy──> [Base64Page.tsx] ──> [CodecView.tsx] + [utils/base64.ts]
    └── /url    ──lazy──> [UrlCodecPage.tsx] ──> [CodecView.tsx] + [utils/urlCodec.ts]

[App.tsx]  ── 布局  ──> [Sidebar.tsx]  (左侧菜单，NavLink 驱动路由跳转)
    │                     └── menuItems 数组配置（{ path, label, icon }）
    ├── <Outlet /> ── 渲染当前路由页面
    └── HeaderRight.tsx   (独立状态：全屏 / 主题 / 等)

[JwtDecodePage.tsx]  ── 导入  ──> [useJwt.ts]        (Hook，纯逻辑)
    │
    ├── 导入 ──> [JwtInput.tsx]     (展示组件，受控输入 + 高亮叠层)
    └── lazy ──> [JwtOutput.tsx]    (展示组件，Shiki 高亮 + 状态动画)
                     └── 导入 ──> [CopyButton.tsx]

[global.css]  ──由──> [entry.css] 通过 @theme 映射为 Tailwind 工具类，被各组件 className 引用
```

- `router.tsx` 是路由入口，`App.tsx` 退化为布局壳，不再持有业务状态。
- `JwtDecodePage.tsx` 作为 JWT 功能页，持有 `jwtInput` 状态并协调 `useJwt` / `JwtInput` / `JwtOutput`。
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
- **菜单布局改造**：引入 `react-router-dom` 路由层，新增 `router.tsx`（路由表）、`Sidebar.tsx`（左侧菜单栏，桌面固定 w-56 / 移动端汉堡折叠）、`pages/JwtDecodePage.tsx`（原 JWT 功能从 App.tsx 抽出）、`pages/ComingSoonPage.tsx`（未来功能占位页）；`App.tsx` 退化为布局壳（`Sidebar` + `HeaderRight` + `<Outlet />`），`entry.tsx` 改用 `RouterProvider` 挂载；菜单项由 `menuItems` 数组配置，后续新增功能只需追加路由与菜单项。
- **Base64 / URL 编解码功能页**：新增 `pages/Base64Page.tsx`、`pages/UrlCodecPage.tsx` 与共享的 `components/CodecView.tsx`；工具函数抽到 `utils/base64.ts`、`utils/urlCodec.ts`。原 `ComingSoonPage.tsx` 已删除，路由表切换到真实页面。`CodecView` 沿用 `useMemo` 同步派生思路，结果按 `error / empty / success` 三态呈现，与 JWT 页视觉风格统一。
