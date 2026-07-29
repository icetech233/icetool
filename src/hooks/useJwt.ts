'use client';

/**
 * Custom hook for decoding JSON Web Tokens (JWT).
 * Encapsulates the logic for parsing, decoding, and validating a JWT string.
 * This hook is decoupled from the UI and can be reused in any component.
 */
import { useState, useEffect } from 'react';

interface DecodedJwt {
  header: string | null;
  payload: string | null;
  signature: string | null;
  error: string | null;
}

/**
 * Decodes a Base64Url encoded string.
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
  // Decode
  const decoded = atob(base64);
  // Convert to object and format
  return JSON.stringify(JSON.parse(decoded), null, 2);
};

/**
 * A custom hook that takes a JWT token string and returns its decoded parts.
 * @param token The JWT string to decode.
 * @returns An object containing the decoded header, payload, signature, and any potential error.
 */
export function useJwt(token: string): DecodedJwt {
  const [decoded, setDecoded] = useState<DecodedJwt>({
    header: null,
    payload: null,
    signature: null,
    error: null,
  });

  useEffect(() => {
    if (!token.trim()) {
      setDecoded({ header: null, payload: null, signature: null, error: null });
      return;
    }

    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        setDecoded({
          header: null,
          payload: null,
          signature: null,
          error: '无效的 JWT 格式，应该是 xxx.yyy.zzz 三部分',
        });
        return;
      }

      const header = base64UrlDecode(parts[0]);
      const payload = base64UrlDecode(parts[1]);
      const signature = parts[2];

      setDecoded({
        header,
        payload,
        signature,
        error: null,
      });
    } catch (err) {
      setDecoded({
        header: null,
        payload: null,
        signature: null,
        error: '解码失败，请检查 JWT 格式是否正确',
      });
    }
  }, [token]);

  return decoded;
}
