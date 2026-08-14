/**
 * ColorTrends —— 色彩趋势（全宽区右栏）。
 * - 基于本地历史的色值，统计色相分布直方图（12 桶）。
 * - 展示最常使用的色相区间与记录总数。
 * - 纯本地计算，无图表库依赖。
 */
import { useEffect, useMemo, useState } from 'react';
import { listHistory } from '../../utils/storage/colorDB';
import { hueHistogram } from '../../utils/color/convert';
import type { HistoryItem } from '../../utils/color/types';

const HUE_NAMES = [
  '红',
  '橙红',
  '橙',
  '黄',
  '黄绿',
  '绿',
  '青绿',
  '青',
  '蓝',
  '蓝紫',
  '紫',
  '品红',
];

export default function ColorTrends({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    listHistory(200).then(setItems);
  }, [refreshKey]);

  const { histogram, total, topBucket } = useMemo(() => {
    const hexes = items.map((i) => i.hexa);
    const hist = hueHistogram(hexes, 12);
    const sum = hist.reduce((a, b) => a + b, 0);
    const maxIdx = hist.indexOf(Math.max(...hist));
    return { histogram: hist, total: sum, topBucket: maxIdx };
  }, [items]);

  const maxCount = Math.max(1, ...histogram);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>基于 {total} 条历史记录</span>
        {total > 0 && (
          <span>
            偏好色相：
            <span className="font-medium text-foreground">{HUE_NAMES[topBucket]}</span>
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="rounded-lg bg-muted/40 px-3 py-6 text-center text-xs text-muted-foreground">
          积累一些取色记录后，这里会展示你的色彩偏好分布。
        </p>
      ) : (
        <div className="flex h-40 items-end gap-1.5" role="img" aria-label="色相分布直方图">
          {histogram.map((c, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-primary/70 transition-all duration-300"
                style={{ height: `${(c / maxCount) * 100}%`, minHeight: c > 0 ? '4px' : '0px' }}
                title={`${HUE_NAMES[i]}：${c} 次`}
              />
              <span className="text-[9px] text-muted-foreground">{HUE_NAMES[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
