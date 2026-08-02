// 临时脚本：校验深色主题 token 的 WCAG 对比度，运行后即删除。
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
}
function lum([r, g, b]) {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [l1, l2] = [lum(hslToRgb(...a)), lum(hslToRgb(...b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const dark = {
  background: [210, 25, 8],
  foreground: [200, 12, 93],
  card: [210, 22, 11],
  cardForeground: [200, 12, 93],
  primary: [204, 88, 60],
  secondary: [204, 45, 22],
  secondaryForeground: [204, 70, 82],
  muted: [210, 18, 15],
  mutedForeground: [205, 12, 68],
  accent: [142, 55, 58],
  accentForeground: [142, 60, 85],
  destructive: [0, 82, 66],
  border: [208, 14, 34],
  input: [210, 20, 13],
  jwtHeader: [35, 95, 62],
  jwtPayload: [204, 88, 66],
  jwtSignature: [142, 60, 58],
};

const pairs = [
  ['foreground / background', dark.foreground, dark.background, 4.5],
  ['cardForeground / card', dark.cardForeground, dark.card, 4.5],
  ['mutedForeground / background', dark.mutedForeground, dark.background, 4.5],
  ['mutedForeground / card', dark.mutedForeground, dark.card, 4.5],
  ['mutedForeground / muted', dark.mutedForeground, dark.muted, 4.5],
  ['primary / background', dark.primary, dark.background, 4.5],
  ['primary / card', dark.primary, dark.card, 4.5],
  ['destructive / card', dark.destructive, dark.card, 4.5],
  ['secondaryForeground / secondary', dark.secondaryForeground, dark.secondary, 4.5],
  ['secondaryForeground / muted', dark.secondaryForeground, dark.muted, 4.5],
  ['accentForeground / muted', dark.accentForeground, dark.muted, 4.5],
  ['foreground / input', dark.foreground, dark.input, 4.5],
  ['jwtHeader / muted', dark.jwtHeader, dark.muted, 4.5],
  ['jwtPayload / muted', dark.jwtPayload, dark.muted, 4.5],
  ['jwtSignature / muted', dark.jwtSignature, dark.muted, 4.5],
  ['border / card (非文本 3:1)', dark.border, dark.card, 3.0],
];

let fail = 0;
for (const [name, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1  (>=${min})  ${name}`);
}
console.log(fail === 0 ? '\nAll pass' : `\n${fail} failing`);
