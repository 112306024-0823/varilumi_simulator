/**
 * 資源路徑處理工具
 * 
 * 用於處理在不同環境下的資源路徑引用：
 * - 在開發環境中使用相對路徑
 * - 在 WordPress 插件環境中使用 WordPress 提供的路徑前綴
 */

/**
 * 獲取資源文件的完整路徑
 * 
 * @param path - 資源文件相對路徑，例如 "/assets/images/example.png"
 * @returns 完整的資源路徑
 */
export function getAssetPath(path: string): string {
  // 移除開頭的斜線以避免路徑問題
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // 添加調試日誌
  const debug = typeof window !== 'undefined' && (window as any).varilumi_data?.debug;
  
  // 檢查資源路徑
  let assetsUrl: string | undefined;
  
  // 優先使用window.VARILUMI_ASSETS_URL
  if (typeof window !== 'undefined' && (window as any).VARILUMI_ASSETS_URL) {
    assetsUrl = (window as any).VARILUMI_ASSETS_URL;
    if (debug) console.log('Using VARILUMI_ASSETS_URL:', assetsUrl);
  } 
  // 其次嘗試使用通過wp_localize_script傳遞的資源路徑
  else if (typeof window !== 'undefined' && (window as any).varilumi_data?.assets_url) {
    assetsUrl = (window as any).varilumi_data.assets_url;
    if (debug) console.log('Using varilumi_data.assets_url:', assetsUrl);
  }
  
  // 如果找到了WordPress資源URL，使用它
  if (assetsUrl) {
    const fullPath = `${assetsUrl}${cleanPath}`;
    if (debug) console.log('Full asset path:', fullPath, 'for resource:', path);
    return fullPath;
  }
  
  // 在開發環境中，使用基本路徑
  if (debug) console.log('Using development path:', `./${cleanPath}`, 'for resource:', path);
  return `./${cleanPath}`;
}

/**
 * 計算三次貝塞爾曲線上的點
 * 
 * 用於創建平滑的動畫過渡曲線
 * 
 * @param t - 進度值，範圍 0-1
 * @param p1y - 第一控制點 y 坐標
 * @param p2y - 第二控制點 y 坐標
 * @returns 曲線上對應的 y 值
 */
export function cubicBezier(
  t: number, 
  p1y: number = 0.6, 
  p2y: number = 0.9
): number {
  // 標準三次貝塞爾曲線方程
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  
  // 計算y值 (使用 P0(0,0) 和 P3(1,1) 作為固定端點)
  return (uuu * 0) + (3 * uu * t * p1y) + (3 * u * tt * p2y) + (ttt * 1);
} 