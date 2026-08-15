/**
 * URL 编解码工具。
 *
 * 两种粒度：
 * - `component`：`encodeURIComponent` / `decodeURIComponent`，用于查询参数、
 *   路径片段等需要转义所有保留字符的场景。
 * - `uri`：`encodeURI` / `decodeURI`，用于完整 URI，保留 `:/?#&=` 等结构化字符。
 *
 * 解码遇到损坏或非法百分号序列时抛出可读错误。
 */

export type UrlCodecMode = 'component' | 'uri';

export function encodeUrl(input: string, mode: UrlCodecMode = 'component'): string {
  if (!input) return '';
  return mode === 'uri' ? encodeURI(input) : encodeURIComponent(input);
}

export function decodeUrl(input: string, mode: UrlCodecMode = 'component'): string {
  if (!input) return '';
  try {
    return mode === 'uri' ? decodeURI(input) : decodeURIComponent(input);
  } catch {
    throw new Error('存在损坏的百分号转义（例如 %E4 后缺少后续字节），无法解码');
  }
}
