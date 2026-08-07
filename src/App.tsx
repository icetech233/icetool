/**
 * 应用根组件：仅装配全局样式与主布局，具体布局见 Layout.tsx。
 */
import Layout from './Layout';
import './global.css';

function App() {
  return <Layout />;
}

export default App;
