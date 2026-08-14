# JWT 解码组件

`JwtDecodePage` 的 UI 拆分。纯前端、零依赖的解码工具，所有数据在浏览器本地处理，不调用任何远程服务。

## 目录结构

```
src/components/jwt/
├── JwtInput.tsx   # 输入区：JWT 文本域 + 实时语法高亮叠层
├── JwtOutput.tsx  # 输出区：Header / Payload / 签名逐段展示 + 字段复制
└── README.md
```

## 数据流

```
JwtDecodePage
  ├─ jwtInput: string                 (输入框受控状态)
  ├─ decoded = useJwt(jwtInput)        (同步派生：{ header, payload, signature, error })
  └─ ── JwtInput (value/onChange) ──► JwtOutput (decoded)
```

- `JwtInput` 是受控输入组件，通过 `value` / `onChange` 与页面双向同步，`JwtDecodePage` 调用 `useJwt` 同步派生解码结果后下传给 `JwtOutput`。
- `JwtOutput` 只做展示与复制，不解码、不发网络请求。

## 各组件职责

### `JwtInput`
- 受控 `<textarea>`，叠放同步滚动的高亮层：`renderHighlightedJWT` 将 JWT 按 `.` 拆分着色（Header 琥珀 / Payload 蓝 / Signature 绿）。
- 文本域 `text-transparent` + 透明边框 + `caret-primary`，文字由高亮层呈现；滚动通过 `handleScroll` 同步两者 `scrollTop/scrollLeft`。

### `JwtOutput`
- 接收 `decoded` 作为 Props，按状态条件渲染（`AnimatePresence mode="wait"`）：
  - **解码成功（success）**：分块展示 Header / Payload / Signature，每块带彩色语义标签与 `CopyButton`；Header、Payload 经 Shiki 高亮，Signature 以等宽文字原样展示。
  - **解码失败（error）**：居中显示警告图标与错误信息，含抖动动画。
  - **初始状态（empty）**：居中显示锁图标与「等待输入...」提示。

## 依赖的模块

- `src/hooks/useJwt.ts`：`useJwt` Hook，同步派生 `{ header, payload, signature, error }`。
- `src/components/base/CopyButton.tsx`：复制按钮。

> 注意：本工具仅做解码（Base64url 分段解析），不做签名验证，也不会把 token 发送到任何第三方。不要在此粘贴生产环境的敏感密钥。
