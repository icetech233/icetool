/**
 * 颜色转换核心逻辑（纯函数，无 React 依赖，便于单元测试）。
 * 设计要点：
 * - 以 HEXA 字符串作为唯一「真值来源」(source of truth)。
 * - parseAnyColor：将任意用户输入（HEX/HEXA/RGB/RGBA/HSL/HSLA）解析为统一的 HEXA。
 * - deriveAllFormats：从某个 HEXA 真值派生出所有格式的展示字符串。
 * - 全程容错：非法输入不抛错，返回 { ok: false }。
 */
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import mixPlugin from 'colord/plugins/mix';
import { ParseResult } from './types';

extend([a11yPlugin, mixPlugin]);

/**
 * 将 colord 实例转为恒定 8 位 HEXA（含 alpha，alpha=1 时补 ff）。
 * colord 原生 toHex() 在 alpha=1 时返回 7 位、<1 时返回 9 位，
 * 这里统一为 8 位以保证真值格式一致、便于比较与复制。
 */
function toHexa(c: ReturnType<typeof colord>): string {
  const rgb = c.toRgb();
  const a = Math.round(rgb.a * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}${a}`;
}

/**
 * 将任意合法颜色字符串解析为标准化 HEXA。
 * 支持：#rgb #rgba #rrggbb #rrggbbaa rgb()/rgba() hsl()/hsla()。
 * 容错：空白返回 ok:false（空输入视为无效而非崩溃）。
 */
export function parseAnyColor(input: string): ParseResult {
  const raw = input.trim();
  if (!raw) {
    return { ok: false, hex: null, error: '请输入颜色值' };
  }

  const c = colord(raw);
  if (!c.isValid()) {
    return { ok: false, hex: null, error: `无法识别的颜色格式：「${raw}」` };
  }

  // 统一导出 HEXA（恒定 8 位，含 alpha），作为真值来源
  return { ok: true, hex: toHexa(c), error: null };
}

/**
 * 将某个色板的 hex 基准值派生为所有展示格式。
 * 输入必须是合法 hex（来自 parseAnyColor 的真值或预设色板），
 * 因此此处假定输入合法、不抛错。
 */
export function deriveAllFormats(hex: string): {
  hex: string;
  hexa: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
} {
  const c = colord(hex);
  const rgb = c.toRgb();
  const hsl = c.toHsl();

  return {
    hex: c.toHex().slice(0, 7),
    hexa: toHexa(c),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Number(rgb.a.toFixed(2))})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    hsla: `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${Number(
      hsl.a.toFixed(2),
    )})`,
  };
}

/**
 * 计算 WCAG 对比度评级。
 * @param hex 当前颜色（HEX 或 HEXA）
 * @returns 与纯白、纯黑背景的对比度及达标情况
 */
export function getContrastRating(hex: string) {
  const c = colord(hex);
  // 背景为白色时，该颜色作为前景；背景为黑色时同理
  const onWhite = c.contrast('#ffffff');
  const onBlack = c.contrast('#000000');

  // WCAG 2.1：普通文本 AA ≥ 4.5 / AAA ≥ 7；大号文本 AA ≥ 3
  const aaForDark = onWhite >= 4.5; // 在白底上需达 AA（自身够深）
  const aaaForDark = onWhite >= 7;
  const aaForLight = onBlack >= 4.5; // 在黑底上需达 AA（自身够浅）
  const aaaForLight = onBlack >= 7;

  return {
    aaForDark,
    aaaForDark,
    aaForLight,
    aaaForLight,
    onWhite: Number(onWhite.toFixed(2)),
    onBlack: Number(onBlack.toFixed(2)),
    recommendedOnWhite: (onWhite >= 4.5 ? 'dark' : 'light') as 'dark' | 'light',
    recommendedOnBlack: (onBlack >= 4.5 ? 'light' : 'dark') as 'dark' | 'light',
  };
}

/**
 * 根据基准色与协调方案生成一组和谐配色。
 */
export function generateHarmony(baseHex: string, type: 'complementary' | 'analogous' | 'triadic'): string[] {
  const base = colord(baseHex);
  const hsl = base.toHsl();
  const rotate = (deg: number) => (hsl.h + deg + 360) % 360;

  switch (type) {
    case 'complementary':
      return [baseHex, toHexa(colord({ ...hsl, h: rotate(180) }))];
    case 'analogous':
      return [
        toHexa(colord({ ...hsl, h: rotate(-30) })),
        baseHex,
        toHexa(colord({ ...hsl, h: rotate(30) })),
      ];
    case 'triadic':
      return [
        baseHex,
        toHexa(colord({ ...hsl, h: rotate(120) })),
        toHexa(colord({ ...hsl, h: rotate(240) })),
      ];
    default:
      return [baseHex];
  }
}

/**
 * 生成随机的合法 HEX 颜色（含合理饱和度/亮度，避免过灰或过黑）。
 */
export function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.floor(Math.random() * 40); // 55-95
  const l = 35 + Math.floor(Math.random() * 40); // 35-75
  return colord({ h, s, l }).toHex();
}

/** 判断字符串是否为合法颜色（供 UI 容错提示使用） */
export function isValidColor(input: string): boolean {
  return colord(input.trim()).isValid();
}
