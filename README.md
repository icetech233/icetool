# JWT 解码工具 (jwt-parse)

本地运行的在线 JWT 解码工具，解析 Header / Payload / Signature，数据不出浏览器。

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS v4
- 动画：`motion` (原 framer-motion)

## 快速开始

```bash
bun install      # 安装依赖
bun run dev      # 启动开发服务器
bun run build    # 类型检查并构建生产产物
bun run preview  # 本地预览构建产物
bun run typecheck# 仅类型检查
bun run lint     # 代码规范检查 (ESLint)
```

## 脚本说明

| 命令 | 作用 |
| --- | --- |
| `dev` | 启动 Vite 开发服务器 |
| `build` | 先 `tsc --noEmit` 类型检查，再 `vite build` 构建 |
| `preview` | 预览构建产物 |
| `typecheck` | 仅运行 TypeScript 类型检查 |
| `lint` | 运行 ESLint 检查 `src` 目录 |

## 项目结构

```
src/
  entry.tsx          应用入口
  App.tsx            主页面
  components/        组件（含 JwtOutput 等）
  hooks/             自定义 hooks
  global.css         全局样式（含主题变量与滚动条样式）
  vite-env.d.ts      Vite 客户端类型声明
```
