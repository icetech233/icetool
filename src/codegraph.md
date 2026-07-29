# CodeGraph

## 概要

本项目的 JWT 解码工具（JWT Parser）是一个基于 React 19 + TypeScript 的纯前端单页应用，
用于实时解析、解码并高亮展示 JWT（JSON Web Token）的 Header、Payload 与 Signature 三部分。
项目采用现代化构建工具链（Rsbuild）与 Tailwind CSS v4，通过自定义 Hook 与展示组件分离关注点，
代码结构清晰、易于维护。UI 使用推特（X）风格的浅色主题。

## 技术栈

- **框架**：React 19（`react` / `react-dom`），函数组件 + Hooks。
- **构建工具**：Rsbuild（`@rsbuild/core` + `@rsbuild/plugin-react`），启动/构建/预览脚本见 `package.json`。
- **样式方案**：Tailwind CSS v4（`@tailwindcss/postcss` + `tailwindcss`），采用 CSS-first 配置。
- **语言**：TypeScript（`tsconfig.json`）。
- **说明**：`framer-motion` 已在 `package.json` 中声明为依赖，但当前源码中尚未使用。

## 文件结构与模块职责

```
jwtparse/
├── package.json            # 依赖与脚本（dev / build / preview）
├── rsbuild.config.ts       # Rsbuild 构建配置（React 插件 + Tailwind PostCSS 插件）
├── postcss.config.js       # PostCSS 配置
├── tsconfig.json           # TypeScript 配置
├── bun.lock                # Bun 依赖锁文件
└── src/
    ├── entry.tsx           # 应用入口，挂载 <App /> 到 DOM
    ├── entry.css           # Tailwind 引入 + @theme 变量映射（连接 CSS 变量到工具类）
    ├── global.css          # 全局样式：推特浅色主题 CSS 变量、滚动条、选中样式
    ├── App.tsx             # 主组件：布局容器 + 状态协调
    ├── codegraph.md        # 本文档
    ├── components/
    │   ├── JwtInput.tsx    # JWT 输入组件（文本域 + 实时语法高亮）
    │   └── JwtOutput.tsx   # JWT 解码结果展示组件
    └── hooks/
        └── useJwt.ts       # JWT 解码核心逻辑 Hook
```

### 样式系统（Tailwind v4 CSS-first）

- `entry.css`：通过 `@import "tailwindcss"` 引入 Tailwind，并使用 `@custom-variant dark` 支持 class 模式；
  `@theme inline` 块将 `global.css` 中定义的 HSL CSS 变量（如 `--color-background`）映射为 Tailwind 工具类
  （`bg-background`、`text-foreground`、`border-border` 等），并保留 `bg-primary/20` 这类透明度修饰符支持。
- `global.css`：在 `:root` 中定义全部主题颜色变量，采用推特（X）浅色风格：
  - 页面背景浅灰 `#f7f9f9`，卡片纯白，形成层次感；
  - 主色推特蓝 `#1d9bf0`（`--primary`）；
  - 文本近黑 `#0f1419`，次要文字中灰；
  - 边框/输入框极浅灰；
  - JWT 高亮：Header 琥珀色、Payload 推特蓝、Signature 绿色。

## 核心组件与数据流

### 1. `App.tsx`（主应用组件）

- **职责**：
  - 应用根组件与响应式布局容器（大屏左右分栏，小屏上下堆叠）。
  - 通过 `useState` 维护核心状态 `jwtInput`（用户输入的 JWT 字符串）。
  - 调用 `useJwt(jwtInput)` 获取解码结果 `decoded`。
  - 将状态与回调通过 Props 下发给 `JwtInput` 与 `JwtOutput`。
- **数据流**：`App` → `JwtInput` / `JwtOutput`

### 2. `useJwt.ts`（JWT 解码 Hook）

- **职责**：
  - 输入：JWT 字符串；输出：`{ header, payload, signature, error }`。
  - 通过 `useEffect` 在 `token` 变化时触发解码：
    - 空输入时重置状态（等待输入提示）。
    - 按 `.` 拆分为 3 段，否则返回格式错误。
    - 对 Header、Payload 做 Base64Url 解码并 `JSON.parse` 后格式化（2 空格缩进）。
    - Signature 原样保留（不解密，仅展示）。
    - 任何异常（Base64/JSON 解析失败）返回统一的「解码失败」错误。
  - 纯逻辑，不依赖任何 UI 组件，可复用。
- **依赖**：仅 React 基础 Hook。

### 3. `JwtInput.tsx`（JWT 输入组件）

- **职责**：
  - 渲染 `<textarea>` 供用户输入；通过受控 `value` / `onChange` 与父组件 `App` 双向同步。
  - 叠放一个同步滚动的 `<div>` 高亮层：`renderHighlightedJWT` 将 JWT 按 `.` 拆分，分别对
    Header / Payload / Signature 着色（颜色取自 `--jwt-*` CSS 变量），分隔点 `.` 用前景色。
  - 文本域文字透明、文字填充由高亮层呈现，滚动通过 `handleScroll` 同步。
- **数据流**：`JwtInput` → `App`（通过 `onChange` 回调上抛输入）

### 4. `JwtOutput.tsx`（JWT 输出组件）

- **职责**：
  - 接收 `decoded` 作为 Props，按状态条件渲染：
    - **解码成功**：分块展示 Header / Payload / Signature，每块带彩色标签（HEADER / PAYLOAD / SIGNATURE）与 JSON 内容。
    - **解码失败**：居中显示警告图标与错误信息（`text-destructive`）。
    - **初始状态**：居中显示锁图标与「等待输入...」提示。
- **数据流**：`App` → `JwtOutput`（通过 `decoded` Prop）

## 模块依赖关系图

```
[App.tsx]  ── 导入  ──> [useJwt.ts]   (Hook，纯逻辑)
    │
    ├── 导入 ──> [JwtInput.tsx]   (展示组件，受控输入 + 高亮)
    │
    └── 导入 ──> [JwtOutput.tsx]  (展示组件，解码结果展示)

[global.css]  ──由──> [entry.css] 通过 @theme 映射为 Tailwind 工具类，被各组件 className 引用
```

- `App.tsx` 是中心协调者，持有唯一可变状态 `jwtInput`。
- `useJwt.ts` 封装全部解码业务逻辑，与 UI 解耦。
- `JwtInput.tsx`、`JwtOutput.tsx` 为纯展示组件，分别负责「输入」「输出」UI，不直接持有 JWT 状态。
- 主题完全由 `global.css` 的 CSS 变量驱动，组件仅需使用语义化工具类（如 `bg-card`、`text-primary`），
  因此切换主题无需改动组件代码。
