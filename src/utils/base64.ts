/**
 * UTF-8 安全的 Base64 编解码工具。
 *
 * - `encodeBase64`：把任意 Unicode 文本按 UTF-8 编码成 Base64，可选输出 URL-safe 变体
 *   （`-`/`_` 替换 `+`/`/`，并去除末尾 `=` 填充）。
 * - `decodeBase64`：解码任意 Base64 字符串到 UTF-8 文本，同时兼容 URL-safe 变体，
 *   自动补齐 `=` 填充，遇到非法编码或非 UTF-8 字节序列时抛出可读错误。
 */

const isWhitespace = /\s/g;

function stripAndNormalize(input: string): string {
  return input.replace(isWhitespace, '').replace(/-/g, '+').replace(/_/g, '/');
}

export function encodeBase64(input: string, urlSafe = false): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let output = btoa(binary);
  if (urlSafe) {
    output = output.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return output;
}

export function decodeBase64(input: string): string {
  if (!input) return '';
  let normalized = stripAndNormalize(input);
  if (!/^[A-Za-z0-9+/]*=*$/.test(normalized)) {
    throw new Error('包含非法字符，无法作为 Base64 解码');
  }
  while (normalized.length % 4) {
    normalized += '=';
  }
  let binary: string;
  try {
    binary = atob(normalized);
  } catch {
    throw new Error('Base64 结构无效，请检查内容长度与填充');
  }
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('解码后的字节序列不是有效的 UTF-8 文本');
  }
}
