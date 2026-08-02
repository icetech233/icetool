/**
 * JWT 解码工具主组件
 * 提供响应式布局，并协调 JWT 输入、解码和输出显示。
 * 通过自定义 hook 和子组件实现了关注点分离。
 */
import { lazy, Suspense, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { useJwt } from './hooks/useJwt';
import { JwtInput } from './components/JwtInput';
import HeaderRight from './components/HeaderRight';
import './global.css';

// 把依赖 Shiki 高亮引擎的组件按需懒加载，避免其（数百 kB）被打入首屏主包。
const JwtOutput = lazy(() =>
  import('./components/JwtOutput').then((m) => ({ default: m.JwtOutput })),
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
};

function App() {
  const [jwtInput, setJwtInput] = useState('');
  const decoded = useJwt(jwtInput);

  return (
    <motion.div
      className="min-h-screen bg-background text-foreground p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 标题区域 + 右上角工具区 */}
      <motion.div
        className="max-w-7xl mx-auto mb-8 flex items-center justify-between gap-4"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">JWT 解码工具</h1>
          <p className="text-muted-foreground">输入 JWT Token，实时查看解码结果</p>
        </div>
        <HeaderRight />
      </motion.div>

      {/* 主内容区域 - 响应式布局 */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 lg:items-stretch">
        {/* 左侧输入区 */}
        <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
          <JwtInput value={jwtInput} onChange={setJwtInput} />
        </motion.div>

        {/* 右侧解码区 */}
        <motion.div
          className="lg:flex-1 lg:basis-0 min-w-0 bg-card rounded-xl border border-border p-6 shadow-sm"
          variants={itemVariants}
        >
          <h2 className="text-sm font-medium text-foreground mb-3">解码结果</h2>
          <Suspense fallback={<div className="min-h-96" />}>
            <JwtOutput decoded={decoded} />
          </Suspense>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default App;
