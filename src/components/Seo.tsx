import { useEffect } from 'react';

/**
 * 动态 SEO 组件：在页面挂载时设置 document.title、meta description、
 * canonical 与 og:url，让每个路由都拥有独立的搜索引擎元信息。
 */
type SeoProps = {
  title: string;
  description: string;
  /** 相对路径，如 "/jwt"，会自动拼接站点域名 */
  path?: string;
};

const SITE_ORIGIN = 'https://jwtparse.vercel.app';

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function Seo({ title, description, path = '/' }: SeoProps) {
  const url = `${SITE_ORIGIN}${path}`;

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, url]);

  return null;
}
