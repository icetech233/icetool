/**
 * Custom hook for decoding JSON Web Tokens (JWT).
 * Encapsulates the logic for parsing, decoding, and validating a JWT string.
 * This hook is decoupled from the UI and can be reused in any component.
 */
import { useMemo } from 'react';

interface DecodedJwt {
  header: string | null;
  payload: string | null;
  signature: string | null;
  error: string | null;
}

/**
 * Decodes a Base64Url encoded string into a formatted JSON string.
 * Uses TextDecoder to correctly restore multi-byte UTF-8 characters
 * (e.g. Chinese), which `atob` alone would corrupt.
 * @param str The Base64Url string to decode.
 * @returns A formatted JSON string.
 */
const base64UrlDecode = (str: string): string => {
  // Convert Base64Url to Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding
  while (base64.length % 4) {
    base64 += '=';
  }
  // atob returns a binary string (one char per byte). Convert to bytes first,
  // then decode as UTF-8 so Chinese / multi-byte content stays intact.
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const decoded = new TextDecoder('utf-8').decode(bytes);
  // Convert to object and format
  return JSON.stringify(JSON.parse(decoded), null, 2);
};

/**
 * A custom hook that takes a JWT token string and returns its decoded parts.
 * The decode result is a pure synchronous derivation of `token`, so it is
 * computed with useMemo (single render pass, no redundant re-render).
 * @param token The JWT string to decode.
 * @returns An object containing the decoded header, payload, signature, and any potential error.
 */
export function useJwt(token: string): DecodedJwt {
  return useMemo<DecodedJwt>(() => {
    if (!token.trim()) {
      return { header: null, payload: null, signature: null, error: null };
    }

    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return {
          header: null,
          payload: null,
          signature: null,
          error: '无效的 JWT 格式，应该是 xxx.yyy.zzz 三部分',
        };
      }

      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      const signature = parts[2];

      return {
        header,
        payload,
        signature,
        error: null,
      };
    } catch {
      return {
        header: null,
        payload: null,
        signature: null,
        error: '解码失败，请检查 JWT 格式是否正确',
      };
    }
  }, [token]);
}
