# JWT 解码组件

`JwtDecodePage` 的 UI 拆分。纯前端、零依赖的解码工具，不调用任何远程服务（仅可选地从 `jwt.io` 拉取公钥做签名验证）。

## 目录结构

```
src/components/jwt/
├── JwtInput.tsx   # 输入区：粘贴 / 文件上传 / 粘贴板导入 / 文本域 + 解码按钮
├── JwtOutput.tsx  # 输出区：Header / Payload / 签名逐段展示 + 字段复制
└── README.md
```

## 数据流

```
JwtDecodePage
  ├─ token: string               (输入框受控状态)
  ├─ result: DecodedJwt | null   (解码结果：header / payload / signature + 错误)
  ├─ isVerifying / verifyMsg     (可选的签名验证状态)
  └─ ── JwtInput (onDecode) ──► JwtOutput (result)
```

- `JwtInput` 通过 `onDecode(token)` 把 token 交给页面，`JwtDecodePage` 调用 `decodeJwt` 计算 `result` 后下传给 `JwtOutput`。
- `JwtOutput` 只做展示与复制，不解码、不发网络请求。

## 各组件职责

### `JwtInput`
- 文本域输入 JWT，支持三种导入方式：
  - 粘贴（textarea 直接输入）
  - 文件上传（读取 `.txt` / 纯文本文件内容）
  - 剪贴板导入（`navigator.clipboard.readText()`，需用户手势授权）
- 「解码」按钮触发 `onDecode`，并把 token 同步回 `JwtDecodePage` 受控状态。

### `JwtOutput`
- 三段式展示：Header / Payload / Signature，使用语法高亮（JSON 美化）。
- 每段提供「复制」按钮，复制该段原始文本。
- 当解码失败时，展示明确错误提示（如「不是合法的 JWT」「Base64 解码失败」）；签名验证结果通过 `verifyMsg` 展示「有效 / 无效 / 未验证」状态。
- 过期时间（`exp`）等时间字段会以可读形式提示。

## 依赖的模块

- `src/utils/jwt/types.ts`：`DecodedJwt`、`VerifyResult` 等类型。
- `src/utils/jwt/decode.ts`：`decodeJwt`（Base64url 解码 + 分段解析）、`verifySignature`（可选，`jwt.io` 公钥拉取）。

> 注意：本工具仅做解码与本地签名校验，不会把 token 发送到任何第三方（除非用户主动点选远程公钥验证）。不要在此粘贴生产环境的敏感密钥。
