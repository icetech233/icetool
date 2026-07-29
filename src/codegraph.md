# CodeGraph

## 概要

本 CodeGraph 文档旨在阐明 JWT 解码工具的项目架构。该项目遵循现代 React 最佳实践，通过组件化和自定义 Hook 将关注点分离，实现了清晰、可维护的代码结构。

## 文件结构与模块职责

- **/src**: 存放所有源代码。
  - **/components**: 存放所有独立的 React UI 组件。
    - `JwtInput.tsx`: JWT 输入组件，负责提供文本输入区域并实现语法高亮。
    - `JwtOutput.tsx`: JWT 解码结果展示组件，负责格式化显示解码后的 Header、Payload 和错误信息。
  - **/hooks**: 存放所有自定义 React Hooks。
    - `useJwt.ts`: 核心解码逻辑的自定义 Hook，封装了 JWT 的解析和验证过程。
  - `App.tsx`: 应用主组件，作为布局容器，协调状态和数据流。
  - `global.css`: 全局样式文件，定义了应用的深色主题、颜色变量和核心布局样式。
- `codegraph.md`: 本文档。

## 核心组件与数据流

### 1. `App.tsx` (主应用组件)

- **职责**:
  - 作为应用的根组件和布局容器，定义了输入区和输出区的整体响应式布局（大屏左右，小屏上下）。
  - 管理核心状态 `jwtInput`，通过 `useState` 存储用户输入的 JWT 字符串。
  - 调用 `useJwt` Hook，将 `jwtInput` 作为参数传入，获取解码后的数据 `decodedJwt`。
  - 将状态和回调函数通过 Props 传递给子组件 `JwtInput` 和 `JwtOutput`。
- **数据流**: `App` -> `JwtInput` / `JwtOutput`

### 2. `useJwt.ts` (JWT 解码 Hook)

- **职责**:
  - 接收一个 JWT 字符串作为输入。
  - 使用 `useEffect` 在输入字符串变化时触发解码逻辑。
  - 负责 Base64 URL 解码和 JSON 解析。
  - 处理解码过程中的各种错误（如格式错误、JSON 解析失败等）。
  - 返回一个包含解码后数据（`header`, `payload`, `signature`）或错误信息的状态对象。
- **依赖**: 纯逻辑，不依赖任何 UI 组件。

### 3. `JwtInput.tsx` (JWT 输入组件)

- **职责**:
  - 渲染一个 `<textarea>` 供用户输入 JWT。
  - 维护一个与 `<textarea>` 同步滚动的 `<div>`，通过 `renderHighlightedJWT` 函数实现对 JWT Header、Payload 和 Signature 部分的颜色高亮。
  - 通过 `onChange` 回调将用户的输入传递回父组件 `App`。
- **数据流**: `JwtInput` -> `App` (通过 `onChange`)

### 4. `JwtOutput.tsx` (JWT 输出组件)

- **职责**:
  - 接收解码后的数据 `decodedJwt` 作为 Props。
  - 根据 `decodedJwt` 的状态，条件渲染以下内容之一：
    - 解码成功时：格式化并高亮显示 Header 和 Payload 的 JSON 数据。
    - 解码失败时：显示具体的错误信息。
    - 初始状态时：显示等待输入的提示信息。
- **数据流**: `App` -> `JwtOutput` (通过 `decoded` Prop)

## 模块依赖关系图

```
[App.tsx]
    |
    +---> [useJwt.ts] (Hook)
    |
    +---> [JwtInput.tsx] (Component)
    |
    +---> [JwtOutput.tsx] (Component)
```
- `App.tsx` 是中心协调者。
- `useJwt.ts` 封装了所有业务逻辑。
- `JwtInput.tsx` 和 `JwtOutput.tsx` 是纯粹的展示组件，分别负责“输入”和“输出”的 UI。
