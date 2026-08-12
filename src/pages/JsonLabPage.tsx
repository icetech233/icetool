/**
 * JSON 实验室：清理、压缩转义、解析、格式化四合一。
 *
 * 顶部功能页签切换四种能力，每种能力独立的控制条 + 计算逻辑拆分在
 * src/components/json/*Mode.tsx 中，此页面只负责状态编排与布局装配。
 */
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import Seo from '../components/Seo';
import { containerVariants, itemVariants } from '../components/json/animations';
import JsonToolbar from '../components/json/JsonToolbar';
import JsonInputPanel from '../components/json/JsonInputPanel';
import JsonOutputPanel from '../components/json/JsonOutputPanel';
import {
  CleanControls,
  DEFAULT_CLEAN_STATE,
  runClean,
} from '../components/json/CleanMode';
import {
  CompressControls,
  DEFAULT_COMPRESS_STATE,
  runCompress,
  type CompressStyle,
} from '../components/json/CompressMode';
import {
  DEFAULT_INDENT,
  FormatControls,
  runFormat,
} from '../components/json/FormatMode';
import { runParse } from '../components/json/ParseMode';
import { DEFAULT_SAMPLE, EMPTY_RESULT, MODES, type Mode } from '../components/json/types';
import type { CleanOptions, IndentOption } from '../utils/json';

export default function JsonLabPage() {
  const [mode, setMode] = useState<Mode>('parse');
  const [input, setInput] = useState<string>(DEFAULT_SAMPLE);
  const [cleanOptions, setCleanOptions] = useState<CleanOptions>(DEFAULT_CLEAN_STATE);
  const [compressStyle, setCompressStyle] = useState<CompressStyle>(DEFAULT_COMPRESS_STATE);
  const [indent, setIndent] = useState<IndentOption>(DEFAULT_INDENT);

  const result = useMemo(() => {
    switch (mode) {
      case 'clean':
        return runClean(input, cleanOptions);
      case 'compress':
        return runCompress(input, compressStyle);
      case 'parse':
        return runParse(input);
      case 'format':
        return runFormat(input, indent);
      default:
        return EMPTY_RESULT;
    }
  }, [mode, input, cleanOptions, compressStyle, indent]);

  const { output, error, report } = result;
  const state: 'error' | 'empty' | 'success' = error ? 'error' : !output ? 'empty' : 'success';
  const currentMode = MODES.find((m) => m.value === mode)!;

  return (
    <motion.div id="json-lab-page" className="relative" variants={containerVariants} initial="hidden" animate="visible">
      <Seo
        title="JSON 实验室 - 在线清理 / 压缩转义 / 解析 / 格式化 - 寒冰工具箱"
        description="在线 JSON 工具集：一键清理空字段、压缩与转义、结构解析、多种缩进格式化，所有处理均在浏览器本地完成。"
        path="/json"
      />

      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary mb-2">JSON 实验室</h1>
        <p className="text-muted-foreground">{currentMode.description}</p>
      </motion.div>

      <JsonToolbar
        mode={mode}
        onModeChange={setMode}
        canSwap={state === 'success' && !!output}
        onSwap={() => output && setInput(output)}
        canClear={!!input}
        onClear={() => setInput('')}
      />

      {mode === 'clean' && <CleanControls value={cleanOptions} onChange={setCleanOptions} />}
      {mode === 'compress' && (
        <CompressControls value={compressStyle} onChange={setCompressStyle} />
      )}
      {mode === 'format' && <FormatControls value={indent} onChange={setIndent} />}

      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <JsonInputPanel value={input} onChange={setInput} />
        <JsonOutputPanel
          state={state}
          output={output}
          error={error}
          inputLength={input.length}
          report={report}
        />
      </div>
    </motion.div>
  );
}
