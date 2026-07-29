---
name: jwtparse-质量与体验优化
overview: 对 JWT 解码器进行 7 项代码质量与体验优化：useJwt 改用 useMemo 并修复 UTF-8 中文解码 Bug、开启 tsconfig strict、删除无效 'use client'、用 framer-motion 添加动画、修复 JwtInput 高亮叠层跨浏览器对齐、修正 codegraph.md 文档漂移。
todos:
  - id: refactor-usejwt
    content: 重构 useJwt 为 useMemo 并用 TextDecoder 修复 UTF-8 解码
    status: completed
  - id: remove-use-client
    content: 删除 4 个源码文件的无效 use client 指令
    status: completed
  - id: enable-strict-tsconfig
    content: 开启 tsconfig strict 等类型安全项并通过编译
    status: completed
    dependencies:
      - refactor-usejwt
  - id: add-framer-animations
    content: 用 framer-motion 为 App 与 JwtOutput 添加炫酷动画
    status: completed
  - id: fix-jwtinput-overlay
    content: 修复 JwtInput 高亮叠层跨浏览器与对齐稳健性
    status: completed
  - id: fix-codegraph-md
    content: 修正 codegraph.md 的 Rsbuild 文档漂移并补充变更
    status: completed
---

## 用户需求

针对现有 JWT 解码工具（纯前端单页应用）进行质量提升与缺陷修复，逐条如下：

- 将 `useJwt` 的解码逻辑由 `useState` + `useEffect` 重构为 `useMemo`，消除 token 变化时的冗余渲染。
- 修复 `base64UrlDecode` 中使用 `atob` 直接转字符串导致的中文 / UTF-8 多字节字符乱码问题。
- 在 `tsconfig.json` 中开启 `strict` 等类型安全选项（`noUnusedLocals` / `noUnusedParameters` 等）。
- 删除 4 个源码文件中无效的 `'use client'` 指令（本项目为 Vite SPA，该指令无效）。
- 使用已声明的 `framer-motion` 为界面添加炫酷的 Web 动画（入场、状态切换、列表错落）。
- 修复 `JwtInput.tsx` 高亮叠层的跨浏览器兼容与对齐稳健性问题（Firefox 文字透明显隐、边框 / 内边距 / 换行度量错位）。
- 修正 `codegraph.md` 中将构建工具误写为 Rsbuild 的文档漂移，并补充本次变更说明。

## 产品概述

在保持纯前端 SPA 架构与推特浅色主题不变的前提下，对解码核心逻辑、类型安全、动画体验、输入高亮层与项目文档进行一次性工程质量提升，最终保证 `vite build` 通过严格类型检查。

## 核心特性

- `useMemo` 同步派生解码结果，单次渲染完成，去除副作用触发的二次渲染。
- `TextDecoder` + `Uint8Array` 正确还原 UTF-8（含中文）明文。
- 开启 TypeScript 严格模式，消除潜在类型隐患。
- 移除无意义的 `'use client'`，保持源码整洁。
- `framer-motion` 实现标题 / 卡片入场动画与解码结果状态切换（AnimatePresence）。
- 高亮叠层在 Chrome / Firefox / Safari 下文字隐藏一致、与输入框像素级对齐。
- `codegraph.md` 准确反映 Vite 技术栈与本次改动。

## 技术栈

- 框架：React 19 + TypeScript（函数组件 + Hooks）
- 构建：Vite 7（`vite.config.ts` 已配置 `@vitejs/plugin-react` 与 `@` 别名）
- 样式：Tailwind CSS v4（CSS-first，`entry.css` `@theme inline` 映射 `global.css` 的 HSL 变量）
- 动画：framer-motion 11（已在 `package.json` 声明，源码尚未引用）
- 主题：推特（X）浅色主题，由 `global.css` 的 CSS 变量驱动

## 实现方案

### 1. `useJwt` 重构为 `useMemo` + UTF-8 修复（`src/hooks/useJwt.ts`）

- 解码是纯同步派生计算，无异步、无副作用，应直接由 `useMemo(() => {...}, [token])` 在渲染期同步产出，不再经过 `useState` 初值 + `useEffect` 二次 `setState` 的两段渲染，从而去除冗余渲染。
- UTF-8 修复：`atob` 返回的是「每字符一字节」的二进制字符串，直接当 UTF-16 字符串会破坏多字节字符。改为 `Uint8Array.from(binary, c => c.charCodeAt(0))` 得到字节数组，再用 `new TextDecoder().decode(bytes)` 还原为正确 UTF-8 文本，最后 `JSON.parse` + 格式化。
- 原 `catch (err)` 改为 `catch`（配合 `noUnusedLocals`/`noUnusedParameters`，未使用绑定会报错）。

### 2. 开启 TypeScript 严格模式（`tsconfig.json`）

- `"strict": true`，并补充 `"noUnusedLocals": true`、`"noUnusedParameters": true`、`"noFallthroughCasesInSwitch": true`、`"forceConsistentCasingInFileNames": true`。
- 已确认 `entry.tsx` 的 `document.getElementById('root')!` 非 null 断言在 strict 下合法；`App.tsx` / `JwtInput.tsx` / `JwtOutput.tsx` 当前类型均自洽，开启 strict 不会新增报错（需先完成 useJwt 的 `catch` 改写与删除 `'use client'`，避免编译失败）。

### 3. 删除无效的 `'use client'`（`useJwt.ts`、`JwtInput.tsx`、`JwtOutput.tsx`、`App.tsx`）

- Vite SPA 无 RSC / 服务端边界，该指令无效且会被 TS/ESLint 视为冗余字符串。直接删除文件首行的 `'use client';` 及其后的空行，不改变任何运行时行为。

### 4. framer-motion 炫酷动画（`App.tsx`、`JwtOutput.tsx`）

- `App.tsx`：标题区与主体容器使用 `motion.div`，配置 `initial`/`animate`（opacity + y 位移）实现入场过渡；可加 `transition` 缓动。
- `JwtOutput.tsx`：用 `AnimatePresence` 包裹「错误 / 等待 / 成功」三种状态，切换时淡入淡出；成功态的 Header / Payload / Signature 卡片用 `motion.div` + `staggerChildren` 错落入场，提升视觉层次。
- 仅引入 `motion` 与 `AnimatePresence`，不新增依赖；动画保持轻量，避免影响输入实时性。

### 5. 高亮叠层跨浏览器与对齐稳健性（`JwtInput.tsx`）

- 文字透明显隐：移除仅 WebKit 生效的 `style={{ WebkitTextFillColor: 'transparent' }}`，改用 Tailwind `text-transparent caret-primary`（Firefox / WebKit / Blink 一致），占位符由 `placeholder:text-muted-foreground` 单独着色。
- 像素级对齐：textarea 与高亮层共享相同 `font-mono text-sm p-4`、相同 `whitespace-pre-wrap break-all` 换行规则与相同边框（textarea 增加 `border border-transparent` 以匹配高亮层的 `border border-border`，避免 box-sizing 差异导致内容区偏移）。
- 滚动同步逻辑保持不变（`handleScroll`），仅确保两层度量完全一致后不再错位。

### 6. 修正文档漂移（`codegraph.md`）

- 将「Rsbuild」「@rsbuild/core」「rsbuild.config.ts」等错误表述替换为 Vite 7 / `vite.config.ts`；更新「framer-motion 尚未使用」为「已用于 App 与 JwtOutput 动画」；补充 useMemo 重构、UTF-8 修复、strict 模式、移除 `'use client'` 的说明，确保文档与真实代码一致。

## 实现注意事项

- **性能**：`useMemo` 仅在 `token` 变化时重算，且消除一次额外渲染，输入实时性优于原方案；`TextDecoder` 每次解码创建开销极小，可接受，无需缓存实例。
- **回退兼容**：所有改动向后兼容，未引入新依赖、未改变输出格式（仍为 2 空格缩进 JSON）。
- **构建验证**：完成后以 `vite build`（含 `tsc` 类型检查链路）验证 strict 通过，避免仅 `vite` 跳过类型检查而漏报。

## 架构设计

保持现有分层：App 持有唯一状态 `jwtInput` → 下发 `JwtInput`（受控输入 + 高亮）/ `JwtOutput`（结果展示）；`useJwt` 为纯逻辑 Hook 与 UI 解耦。本次仅对 Hook 内部实现、类型配置、动画层与文档做增强，不涉及数据流与模块边界调整。

## 目录结构与改动文件

```
jwtparse/
├── tsconfig.json              # [MODIFY] 开启 strict 等类型安全项
├── src/
│   ├── hooks/
│   │   └── useJwt.ts          # [MODIFY] 改用 useMemo；TextDecoder 修复 UTF-8；删除 'use client'
│   ├── App.tsx                # [MODIFY] 删除 'use client'；framer-motion 入场动画
│   ├── components/
│   │   ├── JwtInput.tsx       # [MODIFY] 删除 'use client'；高亮叠层跨浏览器与对齐修复
│   │   └── JwtOutput.tsx      # [MODIFY] 删除 'use client'；framer-motion 状态切换与卡片错落动画
│   └── codegraph.md           # [MODIFY] 修正 Rsbuild→Vite 漂移，补充本次变更
```

## 关键代码结构

```ts
// src/hooks/useJwt.ts —— 解码结果类型（保持现有契约不变）
interface DecodedJwt {
  header: string | null;
  payload: string | null;
  signature: string | null;
  error: string | null;
}

// base64UrlDecode 修复后的核心签名（UTF-8 安全）
const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.stringify(JSON.parse(new TextDecoder().decode(bytes)), null, 2);
};
```