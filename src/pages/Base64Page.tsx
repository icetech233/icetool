import { useCallback } from 'react';
import CodecView, { type CodecVariant } from '../components/base/CodecView';
import { decodeBase64, encodeBase64 } from '../utils/base64';
import Seo from '../components/Seo';

type Base64Variant = 'standard' | 'url';

const VARIANTS: readonly CodecVariant<Base64Variant>[] = [
  { value: 'standard', label: '标准', hint: '标准 Base64，字符集 A-Za-z0-9+/，末尾以 = 填充' },
  { value: 'url', label: 'URL-safe', hint: 'URL-safe 变体，+/替换为-_，去除末尾 = 填充' },
];

export default function Base64Page() {
  const encode = useCallback(
    (input: string, variant: Base64Variant) => encodeBase64(input, variant === 'url'),
    [],
  );
  // 解码时字符集自动兼容，无需区分 variant。
  const decode = useCallback((input: string) => decodeBase64(input), []);

  return (
    <>
      <Seo
        title="Base64 编解码 - 在线编码/解码工具 - 寒冰工具箱"
        description="在线 Base64 编解码工具，按 UTF-8 编码将文本转换为 Base64 或反向解码，支持标准与 URL-safe 变体，纯浏览器本地运算。"
        path="/base64"
      />
      <CodecView<Base64Variant>
      title="Base64 编解码"
      description="按 UTF-8 编码将文本编码为 Base64，或将 Base64 内容解码回原文，支持 URL-safe 变体。"
      encode={encode}
      decode={decode}
      variants={VARIANTS}
      defaultVariant="standard"
      encodePlaceholder="在此输入需要编码的文本..."
      decodePlaceholder="在此粘贴需要解码的 Base64 字符串..."
    />
    </>
  );
}
