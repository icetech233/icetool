# SVG 转 PNG 说明（图标生成）

本项目使用 SVG 作为图标唯一来源（`public/favicon.svg`），再通过脚本栅格化为 PNG，
用于 Apple Touch 图标（`ice-tool-icon.png` / `ice-tool-icon-180x180.png`）。

> 设计理念：改一处 SVG，所有位图自动同步，避免「SVG 和 PNG 长得不一样」的问题。

## 依赖安装

栅格化使用 [`@resvg/resvg-js`](https://github.com/yisibl/resvg-js)，它基于 Rust 的 `resvg`，
能**精确还原** SVG 的渐变、描边、圆角等特性（比纯 JS 方案可靠）。

已写入 `package.json` 的 `devDependencies`：

```json
"devDependencies": {
  "@resvg/resvg-js": "^2.6.2"
}
```

安装依赖（任选其一）：

```bash
bun install          # 推荐，项目默认使用 Bun
# 或
npm install
# 或
pnpm install
```

> 若需单独安装该包：
> ```bash
> bun add -d @resvg/resvg-js
> ```

> ⚠️ 安装报错排查：
> - `@resvg/resvg-js` 包含 **原生二进制（napi）**，需匹配当前平台（win32 / linux / darwin）
>   与 CPU 架构（x64 / arm64）。Bun / npm 会自动下载对应 prebuilt 包（`@resvg/resvg-js-<platform>`）。
> - 若报 `找不到模块` 或二进制缺失：确认 Node/Bun 版本不过旧（建议 Node ≥ 18、Bun ≥ 1.x），
>   删掉 `node_modules` 与 lockfile 后重装。
> - 若网络无法访问 npm registry 下载 prebuilt：可设置镜像（如 `npm config set registry https://registry.npmmirror.com`）
>   或改用系统级工具（见文末「备选方案」）。

## 转换脚本

脚本位置：`scripts/svg2png.ts`

```ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SRC = join(root, 'public', 'favicon.svg');

// [输出路径, 边长(px)]
const OUTPUTS: Array<[string, number]> = [
  [join(root, 'public', 'ice-tool-icon.png'), 180],
  [join(root, 'public', 'ice-tool-icon-180x180.png'), 180],
];

const svg = readFileSync(SRC, 'utf-8');
for (const [outPath, size] of OUTPUTS) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'zoom', value: size / 32 } });
  const png = resvg.render().asPng();
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, png);
}
```

`fitTo.zoom = size / 32` 是因为源 SVG 的 `viewBox` 为 `0 0 32 32`，
缩放比例 = 目标边长 / 源边长，从而输出 180×180 的 PNG。

## 运行方式

通过 npm script（推荐）：

```bash
bun run icons
# 等价： bun run scripts/svg2png.ts
```

输出：

```
✓ public/ice-tool-icon.png (180x180, 14398 bytes)
✓ public/ice-tool-icon-180x180.png (180x180, 14398 bytes)
```

## 在 HTML 中引用

`index.html` 中已配置：

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/ice-tool-icon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/ice-tool-icon-180x180.png" />
```

## 常见改动场景

| 需求 | 做法 |
| --- | --- |
| 换图标样子 | 只改 `public/favicon.svg`，然后 `bun run icons` |
| 新增尺寸（如 512） | 在 `scripts/svg2png.ts` 的 `OUTPUTS` 追加一项，并在 `index.html` 加对应 `<link>` |
| Apple 图标不要圆角 | 源 SVG 圆角会被 iOS 自动遮罩；如需铺满方图，可复制一份无 `rx` 的 SVG 作为图标源 |
| 应用内 Logo | 见 `src/components/Logo.tsx`，其内联 SVG 已与 `favicon.svg` 保持同一套冰晶造型 |

## 备选方案（无 @resvg 时）

- **系统工具**：`rsvg-convert favicon.svg -w 180 -h 180 -o ice-tool-icon.png`
- **ImageMagick**：`magick convert -background none -resize 180x180 favicon.svg ice-tool-icon.png`
- **在线转换**：realfavicongenerator.net（会一并生成多尺寸 + 配置文件）

> 以上工具生成的渲染结果可能与本项目的渐变/描边存在细微差异，建议仍以 `bun run icons` 为准。
