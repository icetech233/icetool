# 寒冰工具箱 (ice-tool)

一个面向开发者的在线编解码工具集，支持 **JSON 实验室**、**JWT 解码**、**Base64 编解码**、**URL 编解码**、**颜色实验室**。

> 所有数据均在浏览器本地处理，不会上传到任何服务器，安全、隐私、开箱即用。

## ✨ 功能特性

- **JSON 实验室**：集清理空字段、压缩转义、结构解析可视化（支持局部全屏）、多种缩进格式化于一体的四合一工具。
- **JWT 解码**：实时解析 `header.payload.signature` 三段结构，自动格式化 JSON，正确处理中文等多字节 UTF-8 字符。
- **Base64 编解码**：UTF-8 安全的 Base64 编解码，支持 URL-safe 变体（`-`/`_` 替换 `+`/`/`，去除 `=` 填充）。
- **URL 编解码**：提供两种粒度 —— 组件级（`encodeURIComponent`）与完整 URI 级（`encodeURI`），对损坏的转义序列给出可读错误。
- **本地优先**：纯前端实现，无后端依赖，数据不出浏览器。
- **深色模式**：自动跟随系统主题，无闪屏（FOUC）。
- **响应式布局**：桌面端侧边栏导航，移动端顶部导航，适配各种屏幕。

## 🛠️ 技术栈

| 类别 | 选型 |
| --- | --- |
| 框架 | React 19 + TypeScript |
| 路由 | react-router-dom 7 |
| 构建 | Vite 8 |
| 样式 | Tailwind CSS 4 |
| 动画 | Motion |

## 🚀 快速开始

### 环境要求

- Node.js（推荐使用 [Bun](https://bun.sh) 以获得最佳体验）
- 包管理器：Bun / npm / pnpm / yarn

### 安装依赖

```bash
bun install
# 或
npm install
```

### 本地开发

```bash
bun dev
# 或
npm run dev
```

启动后访问终端输出的本地地址（默认 `http://localhost:5173`）。

### 构建产物

```bash
bun build
# 或
npm run build
```

构建前会执行 TypeScript 类型检查（`tsc --noEmit`），产物输出到 `dist/` 目录。

### 预览构建结果

```bash
bun preview
# 或
npm run preview
```

### 类型检查

```bash
bun typecheck
# 或
npm run typecheck
```

## 📁 项目结构

```
.
├── index.html              # 应用入口 HTML（含主题防闪屏脚本、SEO/OG 元信息）
├── src/
│   ├── pages/              # 路由页面
│   │   ├── JsonLabPage.tsx     # JSON 实验室
│   │   ├── JwtDecodePage.tsx   # JWT 解码页
│   │   ├── Base64Page.tsx      # Base64 编解码页
│   │   ├── UrlCodecPage.tsx    # URL 编解码页
│   │   ├── ColorLabPage.tsx    # 颜色实验室
│   │   └── ComingSoonPage.tsx  # 即将上线占位页
│   ├── components/         # UI 组件（侧边栏、工具栏、JWT 输入/输出、复制按钮等）
│   ├── hooks/              # 自定义 Hook（useJwt、useSidebarCollapsed、useFullscreen）
│   ├── utils/              # 纯函数工具（base64、urlCodec）
│   ├── config/             # 应用配置
│   ├── router.tsx          # 路由定义
│   ├── Layout.tsx          # 页面布局骨架
│   ├── App.tsx             # 根组件
│   └── entry.tsx           # 应用挂载入口
├── docs/                   # 文档与架构说明
└── public/                 # 静态资源（favicon、图标等）
```

## 🔧 核心工具模块

- `src/utils/base64.ts`：`encodeBase64` / `decodeBase64`，UTF-8 安全、支持 URL-safe。
- `src/utils/urlCodec.ts`：`encodeUrl` / `decodeUrl`，支持 `component` 与 `uri` 两种模式。
- `src/hooks/useJwt.ts`：`useJwt`，将 JWT 字符串解析为 `header / payload / signature / error` 结构，基于 `useMemo` 实现纯同步派生。

## 🌐 部署

本应用为纯静态站点，可部署到任何静态托管服务（如 Vercel、Netlify、GitHub Pages、Nginx 等）。

使用以下命令生成静态产物后，将 `dist/` 目录部署即可：

```bash
bun build
```

## 📄 许可证

仅供学习与个人使用。
