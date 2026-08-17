/**
 * 基于 LCS（最长公共子序列）的行级文本 Diff。
 *
 * 数据不出浏览器，避免依赖 diff/jsdiff 等外部库。
 * 时间复杂度 O(m·n)、空间 O(m·n)，对常见对比场景（数百至数千行）足够。
 *
 * 支持选项：
 * - ignoreWhitespace：忽略行首行尾空白后再比较
 * - ignoreCase：忽略大小写
 */

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

export type DiffOpType = 'equal' | 'remove' | 'add';

export interface DiffOp {
  type: DiffOpType;
  /** 原文行内容（type=equal|remove 时存在） */
  left?: string;
  /** 目标行内容（type=equal|add 时存在） */
  right?: string;
  /** 原文行号（1-based，type=equal|remove 时存在） */
  leftLine?: number;
  /** 目标行号（1-based，type=equal|add 时存在） */
  rightLine?: number;
}

export interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
}

export interface DiffResult {
  ops: DiffOp[];
  stats: DiffStats;
  identical: boolean;
}

function normalizeLine(line: string, options: DiffOptions): string {
  let s = line;
  if (options.ignoreWhitespace) s = s.trim();
  if (options.ignoreCase) s = s.toLowerCase();
  return s;
}

function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

/**
 * 计算行级差异。
 */
export function diffLines(leftText: string, rightText: string, options: DiffOptions = {}): DiffResult {
  const leftLines = splitLines(leftText);
  const rightLines = splitLines(rightText);
  const leftKeys = leftLines.map((l) => normalizeLine(l, options));
  const rightKeys = rightLines.map((l) => normalizeLine(l, options));

  const m = leftKeys.length;
  const n = rightKeys.length;

  // dp[i][j] = leftKeys[0..i) 与 rightKeys[0..j) 的 LCS 长度
  const dp: Uint32Array[] = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftKeys[i - 1] === rightKeys[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = dp[i - 1][j] >= dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1];
      }
    }
  }

  const ops: DiffOp[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (leftKeys[i - 1] === rightKeys[j - 1]) {
      ops.push({
        type: 'equal',
        left: leftLines[i - 1],
        right: rightLines[j - 1],
        leftLine: i,
        rightLine: j,
      });
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ type: 'remove', left: leftLines[i - 1], leftLine: i });
      i--;
    } else {
      ops.push({ type: 'add', right: rightLines[j - 1], rightLine: j });
      j--;
    }
  }
  while (i > 0) {
    ops.push({ type: 'remove', left: leftLines[i - 1], leftLine: i });
    i--;
  }
  while (j > 0) {
    ops.push({ type: 'add', right: rightLines[j - 1], rightLine: j });
    j--;
  }
  ops.reverse();

  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const op of ops) {
    if (op.type === 'add') added++;
    else if (op.type === 'remove') removed++;
    else unchanged++;
  }

  return {
    ops,
    stats: { added, removed, unchanged },
    identical: added === 0 && removed === 0,
  };
}

/**
 * 将 DiffOp 序列重排为 side-by-side 行对：
 * 连续的 remove/add 尽量按顺序左右配对（第 k 个删除对第 k 个新增），
 * 溢出部分则以空行占位。用于并排视图渲染。
 */
export interface SideBySideRow {
  leftLine?: number;
  leftText?: string;
  leftType: 'equal' | 'remove' | 'empty';
  rightLine?: number;
  rightText?: string;
  rightType: 'equal' | 'add' | 'empty';
}

export function toSideBySide(ops: DiffOp[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let k = 0;
  while (k < ops.length) {
    const op = ops[k];
    if (op.type === 'equal') {
      rows.push({
        leftLine: op.leftLine,
        leftText: op.left,
        leftType: 'equal',
        rightLine: op.rightLine,
        rightText: op.right,
        rightType: 'equal',
      });
      k++;
      continue;
    }

    // 收集紧邻的 remove/add 块
    const removes: DiffOp[] = [];
    const adds: DiffOp[] = [];
    while (k < ops.length && ops[k].type !== 'equal') {
      if (ops[k].type === 'remove') removes.push(ops[k]);
      else adds.push(ops[k]);
      k++;
    }
    const len = Math.max(removes.length, adds.length);
    for (let x = 0; x < len; x++) {
      const r = removes[x];
      const a = adds[x];
      rows.push({
        leftLine: r?.leftLine,
        leftText: r?.left,
        leftType: r ? 'remove' : 'empty',
        rightLine: a?.rightLine,
        rightText: a?.right,
        rightType: a ? 'add' : 'empty',
      });
    }
  }
  return rows;
}
