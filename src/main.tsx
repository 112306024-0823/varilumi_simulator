import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 初始化調試信息
if (typeof window !== 'undefined') {
  const debug = (window as any).varilumi_data?.debug;
  if (debug) {
    console.log('Varilumi Simulator 初始化中...');
    console.log('資源路徑信息:');
    console.log('- VARILUMI_ASSETS_URL:', (window as any).VARILUMI_ASSETS_URL);
    console.log('- varilumi_data:', (window as any).varilumi_data);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
