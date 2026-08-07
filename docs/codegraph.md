# CodeGraph

## 概要

本项目是一个基于 React 19 + TypeScript 的纯前端编解码工具集，品牌名「寒冰工具箱」（ICE）。
目前已实现 JWT 解码、Base64 编解码、URL 编解码三个功能，全部数据在浏览器本地处理，不发送到服务端。

项目采用 Vite 8 + Tailwind CSS v4 构建，样式由 CSS 变量驱动明/暗双主题（推特 X 风格配色）。
路由由 `react-router-dom` 驱动，`App.tsx` 退化为入口壳，布局由 `Layout.tsx` 编排，
各功能页面懒加载，代码按 react / motion / shiki 分包。

## 技术栈

- **框架**：React 19（`react` / `react-dom`），函数组件 + Hooks。
- **构建工具**：Vite 8（`vite` + `@vitejs/plugin-react`），脚本见 `package.json`（`dev` / `build` / `preview` / `typecheck`）。
- **样式方案**：Tailwind CSS v4（`@tailwindcss/postcss` + `tailwindcss`），CSS-first 配置，无 `tailwind.config.ts`。
- **语言**：TypeScript 7（`tsconfig.json`，`strict` + `noUnusedLocals` 等全开）。
- **路由**：`react-router-dom`（`^7.18`），`createBrowserRouter` + `RouterProvider`，路由表位于 `router.tsx`，`/` 根路由挂载布局壳，子路由懒加载各功能页面。
- **动画**：`motion`（即 `framer-motion` 的新包名，`^12.43.0`），从 `motion/react` 导入。
- **语法高亮**：`react-shiki`（`^0.11.0`）+ 按需加载的 Shiki 引擎（`@shikijs/langs/json`、`@shikijs/themes/github-light`/`github-dark`），用于 JWT 解码后 JSON 的彩色展示。

## 文件结构与模块职责

```
jwtparse/
├── package.json            # 依赖与脚本
├── vite.config.ts          # Vite 构建配置（React 插件 + `@` 别名 + 手动拆包 + es2020 target）
├── postcss.config.js       # PostCSS 配置（Tailwind v4）
├── tsconfig.json           # TypeScript 配置
├── index.html              # HTML 模板（含首绘前同步主题的内联脚本，localStorage key: ice:theme）
├── bun.lock                # Bun 依赖锁文件
├── public/
│   └── favicon.svg         # SVG 图标（ICE 文字）
└── src/
    ├── entry.tsx           # 应用入口，挂载 <RouterProvider router={router} /> 到 DOM（StrictMode）
    ├── entry.css           # Tailwind 引入 + @theme 变量映射 + Shiki 双主题样式
    ├── global.css          # 全局样式：明/暗双主题 CSS 变量、滚动条、选中样式、JWT 高亮工具类
    ├── App.tsx             # 应用根组件：仅装配 global.css + 渲染 Layout
    ├── Layout.tsx          # 主布局：Sidebar + 顶部 AppToolbar + <Outlet />（Suspense 兜底）
    ├── router.tsx          # 路由表定义（/ → /jwt 重定向，/jwt /base64 /url 子路由）
    ├── config/
    │   └── menuItems.tsx   # 菜单项配置数组（{ path, label, icon }），驱动 Sidebar 与路由
    ├── components/
    │   ├── Sidebar.tsx         # 响应式侧边栏分发器（lg 以上 DesktopSidebar，以下 MobileTopbar）
    │   ├── DesktopSidebar.tsx  # 桌面端侧边栏（固定 w-56 / 折叠 w-16，状态持久化 localStorage）
    │   ├── MobileTopbar.tsx    # 移动端顶部条（Logo + 工具区 + 汉堡菜单按钮 + 下拉菜单）
    │   ├── MenuList.tsx        # 菜单项列表（NavLink 驱动，motion stagger 入场动画）
    │   ├── Logo.tsx            # 品牌 Logo（ICE 图标 + "寒冰工具箱" 文字）
    │   ├── icons.tsx           # 内联 SVG 图标组件（MenuIcon / CloseIcon / ChevronLeftIcon / ChevronRightIcon）
    │   ├── AppToolbar.tsx      # 页面右上角工具区（全屏 / 通知 / 用户 / 主题 / 设置）
    │   ├── JwtInput.tsx        # JWT 输入组件（文本域 + 实时语法高亮叠层）
    │   ├── JwtOutput.tsx       # JWT 解码结果展示组件（懒加载，Shiki 高亮）
    │   ├── CodecView.tsx       # 通用「编解码」双栏视图（三态动画，供 Base64/URL 复用）
    │   └── CopyButton.tsx      # 通用复制按钮（写剪贴板 + 复制反馈）
    ├── pages/
    │   ├── JwtDecodePage.tsx   # JWT 解码功能页
    │   ├── Base64Page.tsx      # Base64 编解码功能页
    │   └── UrlCodecPage.tsx    # URL 编解码功能页
    ├── hooks/
    │   ├── useJwt.ts             # JWT 解码核心逻辑 Hook
    │   ├── useSidebarCollapsed.ts # 侧边栏折叠状态 Hook（持久化 localStorage）
    │   └── useFullscreen.ts      # 全屏状态 Hook（同步真实全屏状态）
    └── utils/
        ├── base64.ts          # UTF-8 安全的 Base64 编解码（含 URL-safe 变体、错误分类）
        └── urlCodec.ts        # URL 编解码（Component / URI 两种粒度）
```

### 样式系统（Tailwind v4 CSS-first）

- `entry.css`：通过 `@import "tailwindcss"` 引入 Tailwind；
  `@custom-variant dark (&:is(.dark *))` 启用基于 `.dark` class 的 `dark:` 变体；
  `@theme inline` 块将 `global.css` 中定义的裸 HSL 通道变量映射为 Tailwind 语义化工具类
  （`bg-background`、`text-foreground`、`border-border` 等），额外定义 `--border-strong`；
  定义 Shiki 双主题 `color/background-color` 规则（`.dark .shiki` 下切换到 `--shiki-dark` 变量）。
- `global.css`：在 `:root`（浅色）与 `.dark`（深色）中分别定义全部主题颜色变量，采用推特（X）风格：
  - 浅色：页面背景浅灰 `#f7f9f9`，卡片纯白，主色推特蓝 `#1d9bf0`，文本近黑 `#0f1419`。
  - 深色：近黑蓝灰页面背景，提亮后的推特蓝主色与绿色等，满足 WCAG 对比度要求。
  - JWT 高亮：Header 琥珀色、Payload 推特蓝、Signature 绿色（明暗两套取值，均满足对比度），通过 `.text-jwt-header` 等工具类引用。
  - 另含滚动条、选中文字、`--radius` 等全局样式。

### 构建与拆包（vite.config.ts）

- `@` → `./src` 路径别名；`resolve.dedupe: ['react','react-dom']` 防止 motion 预构建时打入第二份 React。
- `optimizeDeps.include: ['motion']` 预构建动画库。
- `build.target: 'es2020'`；`server.open: true` 自动打开浏览器。
- `build.rollupOptions.output.manualChunks` 将 `react/react-dom/scheduler`、`motion`、`shiki/@shikijs` 分别拆为独立 chunk。

## 核心组件与数据流

### 1. `App.tsx`（应用根组件）

- **职责**：
  - 极简入口：仅导入 `global.css` 并渲染 `<Layout />`。
  - 不再持有任何业务状态，所有布局逻辑委托给 `Layout.tsx`。

### 2. `Layout.tsx`（应用主布局）

- **职责**：
  - 编排页面整体结构：`Sidebar`（左侧菜单）+ `<header>`（桌面端顶部 `AppToolbar`）+ `<main>`（`<Outlet />` 路由出口）。
  - 桌面端（lg 及以上）：左侧 `Sidebar`，右侧独立顶部 header 承载 `AppToolbar`，下方为内容区。
  - 移动端（lg 以下）：`Sidebar` 内部渲染 `MobileTopbar`，`AppToolbar` 通过 `mobileActions` 插槽注入到汉堡按钮左侧。
  - 外层包裹 `<Suspense>` 兜底路由懒加载的 loading 状态。

### 3. `Sidebar.tsx`（响应式侧边栏分发器）

- **职责**：
  - 根据屏幕尺寸分发两种侧边栏实现：
    - lg 及以上：`DesktopSidebar`（可折叠桌面侧边栏）
    - lg 以下：`MobileTopbar`（移动端顶部条 + 下拉菜单）
  - 两者各自持有独立的状态（collapsed / open），互不干扰。
  - 接收 `mobileActions` 插槽，将 `AppToolbar` 注入到移动端顶部条。

### 4. `DesktopSidebar.tsx`（桌面端侧边栏）

- **职责**：
  - 固定宽度 `w-56`，折叠时变为 `w-16`，带 `transition-[width]` 平滑动画。
  - 顶部区域：`Logo` + 折叠按钮（`ChevronLeftIcon`），折叠时仅展示折叠按钮。
  - 菜单区域：`MenuList` 组件，`collapsed` 控制文字显隐。
  - 折叠状态通过 `useSidebarCollapsed` Hook 持久化到 `localStorage`（key: `ice:sidebar-collapsed`）。
  - 折叠按钮在折叠状态下移至菜单区上方，展开状态下在 Logo 右侧。

### 5. `MobileTopbar.tsx`（移动端顶部条）

- **职责**：
  - 左侧 Logo，右侧为 `actions` 插槽（`AppToolbar`）+ 汉堡按钮。
  - 展开时紧跟下拉菜单，点击菜单项后自动收起。

### 6. `MenuList.tsx`（菜单项列表）

- **职责**：
  - 由 `menuItems` 数组（`config/menuItems.tsx`）驱动渲染，后续新增功能只需追加一项。
  - 使用 `NavLink` 自动根据当前路由高亮激活项（`isActive` 切换 `bg-muted text-foreground`）。
  - 折叠模式下文字通过 `max-w-0 opacity-0` 隐藏，图标水平居中。
  - 使用 `motion` 的 stagger 动画（`listVariants` / `itemVariants`）。

### 7. `Logo.tsx`（品牌 Logo）

- **职责**：
  - 渲染 ICE 图标（蓝色圆角方形 + 白色 ICE 文字）+ "寒冰工具箱" 文字。
  - 文字部分可通过 `textClassName` 控制显隐过渡（如桌面端折叠动画）。

### 8. `AppToolbar.tsx`（右上角工具区）

- **职责**：
  - 推特风格的圆形图标按钮组，从左到右：全屏、通知、用户、主题切换、设置。
  - **全屏**：使用 `useFullscreen` Hook，监听 `fullscreenchange` 同步真实状态。
  - **通知**：装饰性铃铛（带红点），无逻辑。
  - **用户**：展示头像「明」与昵称「小明」。
  - **主题切换**：`toggleTheme` 在 `<html>` 上切换 `.dark` class 并写入 `localStorage.ice:theme`（'dark'/'light'）；
    初始化时同步首绘前已由 `index.html` 内联脚本写入的 DOM 状态，避免二次闪烁；
    未手动指定主题时跟随系统 `prefers-color-scheme` 实时切换。
  - **设置**：装饰性齿轮按钮。

### 9. `useSidebarCollapsed.ts`（侧边栏折叠状态 Hook）

- **职责**：管理桌面端侧边栏折叠状态，通过 `useState` 初始化（从 `localStorage` 读取），
  状态变化时同步写入 `localStorage`（key: `ice:sidebar-collapsed`），返回 `{ collapsed, toggle, setCollapsed }`。

### 10. `useFullscreen.ts`（全屏状态 Hook）

- **职责**：封装 `requestFullscreen` / `exitFullscreen`，监听 `fullscreenchange` 事件同步真实全屏状态，
  返回 `{ isFullscreen, toggle }`。

### 11. `useJwt.ts`（JWT 解码 Hook）

- **职责**：
  - 输入：JWT 字符串；输出：`{ header, payload, signature, error }`（均为 `string | null`）。
  - 通过 `useMemo` 在 `token` 变化时**同步派生**解码结果（单次渲染，无 `useEffect` 触发的冗余二次渲染）。
  - 使用 `Uint8Array` + `TextDecoder('utf-8')` 正确还原 UTF-8 多字节字符。
- **依赖**：仅 React 基础 Hook（`useMemo`）。

### 12. `JwtInput.tsx`（JWT 输入组件）

- **职责**：
  - 受控 `<textarea>`，叠放同步滚动的高亮层：`renderHighlightedJWT` 将 JWT 按 `.` 拆分着色。
  - 文本域 `text-transparent` + 透明边框 + `caret-primary`，文字由高亮层呈现。
  - 滚动通过 `handleScroll` 同步两者 `scrollTop/scrollLeft`。

### 13. `JwtOutput.tsx`（JWT 输出组件，懒加载）

- **职责**：
  - 接收 `decoded` 作为 Props，按状态条件渲染（`AnimatePresence mode="wait"`）：
    - **解码成功（success）**：分块展示 Header / Payload / Signature，每块带彩色语义标签与 `CopyButton`。
      Header、Payload 经 Shiki 高亮（`ShikiHighlighter` + json 语言 + github-light/dark 双主题）；
      Signature 以等宽文字原样展示。
    - **解码失败（error）**：居中显示警告图标与错误信息，含抖动动画。
    - **初始状态（empty）**：居中显示锁图标与「等待输入...」提示。
  - 高亮器通过 `createHighlighterCore` + `createJavaScriptRegexEngine` 在 `useEffect` 中按需加载 json 语言与 github 双主题。
- **数据流**：`JwtDecodePage` → `JwtOutput`（通过 `decoded` Prop）。

### 14. `CodecView.tsx`（通用编解码视图）

- **职责**：
  - 供 Base64、URL 等文本级编解码工具复用的双栏视图。调用方注入 `encode(input, variant)` / `decode(input, variant)` 两个纯函数，以及可选的 `variants` 描述子模式。
  - 顶部工具条：`编码 / 解码` 模式切换、变体切换（可选）、清空、`交换`（把输出灌回输入并翻转方向）。
  - 左列：受控 `<textarea>`；右列：结果展示区，按 `error / empty / success` 三态 `AnimatePresence mode="wait"` 切换，错误态含抖动，成功态附 `CopyButton` 与长度提示。
  - 结果由 `useMemo` 同步派生，与 `useJwt` 思路一致。

### 15. `CopyButton.tsx`（复制按钮）

- **职责**：通用按钮，`navigator.clipboard.writeText` 写入剪贴板，成功后 1.5s 显示「✓ Copied」，失败静默。

### 16. `router.tsx`（路由表）

- **职责**：
  - `createBrowserRouter` 定义路由：`/` 根路径挂载 `App` 布局壳，子路由通过 `Layout` 中的 `<Outlet />` 渲染。
  - 根路径 `/` 与 404 通配 `*` 均重定向到 `/jwt`。
  - 每个功能页面通过 `lazy()` 懒加载，配合 `Layout` 的 `<Suspense>` 边界，实现代码分包。

### 17. `config/menuItems.tsx`（菜单项配置）

- **职责**：导出 `menuItems` 数组，每项包含 `{ path, label, icon }`，驱动 `MenuList` 渲染与路由导航。
  后续新增功能只需在此追加一项。

### 18. 功能页面

- **`JwtDecodePage.tsx`**：持有 `jwtInput` 状态，调用 `useJwt` Hook，协调 `JwtInput` / `JwtOutput` 的渲染。
  `JwtOutput` 通过 `lazy()` 懒加载。
- **`Base64Page.tsx`**：包装 `CodecView`，注入 `encodeBase64` / `decodeBase64`，暴露「标准 / URL-safe」两种变体。
- **`UrlCodecPage.tsx`**：包装 `CodecView`，注入 `encodeUrl` / `decodeUrl`，暴露「Component / URI」两种粒度。

### 19. `utils/base64.ts` / `utils/urlCodec.ts`（编解码工具函数）

- **`base64.ts`**：`encodeBase64` 以 `TextEncoder` 得到 UTF-8 字节后走 `btoa`，可选 URL-safe 变体；`decodeBase64` 兼容 URL-safe 字符集，自动补 `=`，对字符集、结构、UTF-8 三类错误分别抛出可读消息。
- **`urlCodec.ts`**：`encodeUrl` / `decodeUrl`，`mode` 为 `'component'`（`encodeURIComponent`）或 `'uri'`（`encodeURI`）；解码遇到损坏的百分号转义时抛出可读错误。

## 模块依赖关系图

```
[index.html] ──内联脚本──> 首绘前写入 <html class="dark">（防闪屏，localStorage key: ice:theme）
[index.html] ──加载──> [entry.tsx] ──挂载──> [RouterProvider → router.tsx]

[router.tsx] ──createBrowserRouter──> [App.tsx] ──> [Layout.tsx]  (主布局壳)
    │
    ├── / ──重定向──> /jwt
    ├── /jwt ──lazy──> [JwtDecodePage.tsx]
    ├── /base64 ──lazy──> [Base64Page.tsx] ──> [CodecView.tsx] + [utils/base64.ts]
    └── /url    ──lazy──> [UrlCodecPage.tsx] ──> [CodecView.tsx] + [utils/urlCodec.ts]

[Layout.tsx]  ── 布局编排  ──
    ├── [Sidebar.tsx]  (响应式分发器)
    │   ├── lg+: [DesktopSidebar.tsx]  (可折叠，useSidebarCollapsed 持久化)
    │   │   ├── [Logo.tsx]
    │   │   └── [MenuList.tsx]  ──menuItems──> [config/menuItems.tsx]
    │   └── lg-: [MobileTopbar.tsx]  (汉堡菜单 + 下拉)
    │       ├── [Logo.tsx]
    │       └── [MenuList.tsx]
    ├── <header> (桌面端) ── [AppToolbar.tsx]  (全屏/通知/用户/主题/设置)
    │   ├── useFullscreen.ts  (全屏状态)
    │   └── toggleTheme (localStorage: ice:theme)
    └── <main> ── <Outlet />  (路由内容)

[JwtDecodePage.tsx]  ── 导入  ──> [useJwt.ts]  (Hook，纯逻辑)
    │
    ├── 导入 ──> [JwtInput.tsx]  (受控输入 + 高亮叠层)
    └── lazy ──> [JwtOutput.tsx]  (Shiki 高亮 + 状态动画)
                     └── 导入 ──> [CopyButton.tsx]

[global.css]  ──由──> [entry.css] 通过 @theme 映射为 Tailwind 工具类，被各组件 className 引用
```

### 关键架构要点

- `router.tsx` 是路由入口，`App.tsx` 仅渲染 `Layout.tsx`，`Layout.tsx` 编排布局壳与路由出口。
- `Sidebar.tsx` 作为响应式分发器，桌面端 `DesktopSidebar` 支持折叠/展开（持久化 `localStorage`），移动端 `MobileTopbar` 使用汉堡菜单 + 下拉。
- `AppToolbar.tsx` 替代原 `HeaderRight.tsx`，通过 `mobileActions` 插槽注入到移动端顶部条，避免移动端重复渲染顶部条。
- `config/menuItems.tsx` 集中管理菜单项配置，后续新增功能只需追加路由与菜单项。
- `useJwt.ts` 封装 JWT 解码业务逻辑，与 UI 解耦；`CodecView.tsx` 封装通用编解码双栏视图，供 Base64/URL 复用。
- 主题完全由 `global.css` 的 CSS 变量驱动（浅色 `:root` / 深色 `.dark`），组件仅使用语义化工具类，切换主题无需改动组件代码。
- `JwtOutput` 懒加载，Shiki 高亮引擎按需加载 + `manualChunks` 单独拆包，控制主包体积。

## 近期工程变更

- **品牌重塑**：从 "JWT Tools" 更名为「寒冰工具箱」（ICE），Logo 更换为 ICE 图标，localStorage key 前缀改为 `ice:`。
- **布局重构**：`App.tsx` 简化为入口壳，新增 `Layout.tsx` 编排布局，`Sidebar` 拆分为 `DesktopSidebar` + `MobileTopbar` 响应式分发模式。
- **侧边栏折叠**：新增 `useSidebarCollapsed` Hook，桌面端侧边栏支持折叠/展开，状态持久化 `localStorage`，带 `transition-[width]` 平滑动画。
- **菜单项配置化**：新增 `config/menuItems.tsx` 集中管理菜单项，`MenuList` 组件驱动渲染。
- **HeaderRight → AppToolbar**：重命名为 `AppToolbar`，支持 `mobileActions` 插槽注入，全屏逻辑抽为 `useFullscreen` Hook。
- **图标抽离**：侧边栏用到的内联 SVG 图标抽为 `components/icons.tsx`，避免重复定义。
- **语法高亮升级**：`JwtOutput` 改用 `react-shiki` 的 `ShikiHighlighter` 组件，支持 `light`/`dark` 双主题自动切换，替代旧版手动 `createHighlighterCore` 的 thunk 模式。
- **CodecView 状态动画**：输出区改用 `AnimatePresence mode="wait"` 三态切换（error/empty/success），错误态附加抖动动画。
- **构建优化**：`vite.config.ts` 设置 `target: 'es2020'`、`server.open: true`；`manualChunks` 将 react / motion / shiki 拆为独立 chunk。
- **样式增强**：`entry.css` 新增 Shiki 双主题样式；`global.css` 新增 `--border-strong` 变量、`--radius` 变量、JWT 高亮工具类（`.text-jwt-header` 等）。