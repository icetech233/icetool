'use client';

/**
 * JWT 解码工具主组件
 * 提供响应式布局，并协调 JWT 输入、解码和输出显示。
 * 通过自定义 hook 和子组件实现了关注点分离。
 */
import { useState } from 'react';
import { useJwt } from './hooks/useJwt';
import { JwtInput } from './components/JwtInput';
import { JwtOutput } from './components/JwtOutput';
import './global.css';

function App() {
  const [jwtInput, setJwtInput] = useState('');
  const decoded = useJwt(jwtInput);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* 标题区域 */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">JWT 解码工具</h1>
        <p className="text-muted-foreground">输入 JWT Token，实时查看解码结果</p>
      </div>

      {/* 主内容区域 - 响应式布局 */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* 左侧输入区 */}
        <JwtInput value={jwtInput} onChange={setJwtInput} />

        {/* 右侧解码区 */}
        <div className="flex-1 bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-sm font-medium text-foreground mb-3">解码结果</h2>
          <JwtOutput decoded={decoded} />
        </div>
      </div>
    </div>
  );
}

export default App;
