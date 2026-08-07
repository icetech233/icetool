import { useCallback } from 'react';
import CodecView, { type CodecVariant } from '../components/base/CodecView';
import { decodeUrl, encodeUrl, type UrlCodecMode } from '../utils/urlCodec';
import Seo from '../components/Seo';

const VARIANTS: readonly CodecVariant<UrlCodecMode>[] = [
  {
    value: 'component',
    label: 'Component',
    hint: 'encodeURIComponent：转义所有保留字符，适合查询参数与路径片段',
  },
  {
    value: 'uri',
    label: 'URI',
    hint: 'encodeURI：保留 :/?#&= 等结构化字符，适合整段 URI',
  },
];

export default function UrlCodecPage() {
  const encode = useCallback(
    (input: string, variant: UrlCodecMode) => encodeUrl(input, variant),
    [],
  );
  const decode = useCallback(
    (input: string, variant: UrlCodecMode) => decodeUrl(input, variant),
    [],
  );

  return (
    <>
      <Seo
        title="URL 编解码 - 在线百分号编码/解码 - 寒冰工具箱"
        description="在线 URL 编解码工具，对查询参数或整段 URI 做百分号编码与解码，支持 Component 与 URI 两种粒度，数据本地处理。"
        path="/url"
      />
      <CodecView<UrlCodecMode>
      title="URL 编解码"
      description="对 URL 参数或整段 URI 做百分号编码 / 解码，支持 Component 与 URI 两种粒度。"
      encode={encode}
      decode={decode}
      variants={VARIANTS}
      defaultVariant="component"
      encodePlaceholder="例如：张三&age=18"
      decodePlaceholder="例如：%E5%BC%A0%E4%B8%89%26age%3D18"
    />
    </>
  );
}
