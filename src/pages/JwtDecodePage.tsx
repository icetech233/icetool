import { lazy, Suspense, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { useJwt } from '../hooks/useJwt';
import { JwtInput } from '../components/JwtInput';

const JwtOutput = lazy(() =>
  import('../components/JwtOutput').then((m) => ({ default: m.JwtOutput })),
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.02 },
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

export default function JwtDecodePage() {
  const [jwtInput, setJwtInput] = useState('');
  const decoded = useJwt(jwtInput);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="mb-8" variants={itemVariants}>
        <h1 className="text-3xl font-bold text-primary mb-2">JWT 解码工具</h1>
        <p className="text-muted-foreground">输入 JWT Token，实时查看解码结果</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <motion.div className="lg:flex-1 lg:basis-0 min-w-0" variants={itemVariants}>
          <JwtInput value={jwtInput} onChange={setJwtInput} />
        </motion.div>

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
