import React, { useRef, useState, useEffect } from "react";
import type { SceneType, ColorTemperature, SwitchState } from "../types";
import styles from "../styles/main.module.css";
import { getAssetPath } from '../utils/assetUtils';
import { registerSyncEvent } from './WallSwitch'; // 導入同步事件註冊函數

/**
 * 場景區元件
 *
 * 根據目前狀態顯示對應的場景圖，並用 CSS 濾鏡調整亮度。
 *
 * @param scene 場景類型
 * @param color_temp 色溫
 * @param brightness 亮度百分比 (1~100)
 * @param switch_state 壁切開關狀態
 * @param onSwitch 壁切開關狀態變更時的處理函數
 * @param onQuickToggle 快速關開的處理函數
 *
 * @example
 * <SceneDisplay scene="livingroom" color_temp="4000K" brightness={80} switch_state="on" />
 */
interface SceneDisplayProps {
  scene: SceneType;
  color_temp: ColorTemperature;
  brightness: number;
  switch_state: SwitchState;
  onSwitch?: (state: SwitchState) => void;
  onQuickToggle?: () => void;
  getCurrentBrightness?: (brightness: number) => void;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({
  scene,
  color_temp,
  brightness,
  switch_state,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSwitch,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onQuickToggle,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCurrentBrightness,
}) => {
  // 設定關閉時的亮度值固定為0.05 (5%)，使關閉效果更加明顯
  const offBrightness = 0.05;  
  const [displayBrightness, setDisplayBrightness] = useState(switch_state === "off" ? offBrightness : adjustBrightness(brightness / 100));
  const [prevBrightness, setPrevBrightness] = useState(brightness);
  const [prevSwitchState, setPrevSwitchState] = useState(switch_state);
  const animationRef = useRef<number | null>(null);
  // 追蹤是否有快切動畫正在進行
  const [isQuickToggling, setIsQuickToggling] = useState(false);
  // 用於直接控制場景亮度的臨時狀態
  const [tempBrightness, setTempBrightness] = useState<number | null>(null);

  // 圖片檔名規則：scene_{scene}_{color_temp}.png
  const imageName = `scene_${scene}_${color_temp}.png`;
  // 圖片路徑
  const imagePath = getAssetPath(`/assets/images/${imageName}`);
  
  // 監聽快切同步事件
  useEffect(() => {
    // 註冊監聽快切事件
    const unregister = registerSyncEvent((action) => {
      if (action === 'quick-toggle-start') {
        // 清除任何正在進行的動畫
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        
        // 快切開始：立即將場景調暗
        setIsQuickToggling(true);
        // 設定為暗狀態 (5%)
        setTempBrightness(0.05);
      } else if (action === 'quick-toggle-end') {
        // 快切結束：恢復正常亮度控制
        setIsQuickToggling(false);
        setTempBrightness(null);
        
        // 清除任何進行中的動畫
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
      }
    });
    
    // 組件卸載時取消監聽
    return unregister;
  }, [switch_state, brightness]);

  // 提取共用的亮度調整函數
  function adjustBrightness(value: number): number {
    // 設定亮度範圍
    const minBrightness = 0.2; // 最小亮度（1%輸入時）為20%
    const maxBrightness = 0.95; // 將最大亮度稍微降低，避免100%時太亮
    
    // 處理極端情況
    if (value <= 0.01) return minBrightness; // 1%輸入
    if (value >= 1.0) return maxBrightness;  // 100%輸入
    
    // 將輸入值從1-100%轉換到0-1範圍
    const normalizedInput = (value - 0.01) / 0.99;
      
    // 使用分段函數，讓不同亮度範圍有不同的變化曲線
    let adjustedValue;
    
    // 前1/8的進度其速率為1/3
    const firstSegment = 0.125; // 1/8
    
    if (normalizedInput <= firstSegment) {
      // 前1/8的進度，速率為原來的1/3
      adjustedValue = (normalizedInput / firstSegment) * (firstSegment / 3);
    }
    // 1/8到30%範圍：逐漸加速
    else if (normalizedInput <= 0.3) {
      const startVal = firstSegment / 3;
      const segmentProgress = (normalizedInput - firstSegment) / (0.3 - firstSegment);
      const adjustedSegment = Math.pow(segmentProgress, 0.7); // 稍微加速
      adjustedValue = startVal + (0.4 - startVal) * adjustedSegment;
    }
    // 30%-50%範圍：中速區域
    else if (normalizedInput <= 0.5) {
      const transitionProgress = (normalizedInput - 0.3) / 0.2;
      adjustedValue = 0.4 + Math.pow(transitionProgress, 0.8) * 0.2;
    }
    // 50%-90%範圍：變化越來越不明顯
    else if (normalizedInput <= 0.9) {
      const highProgress = (normalizedInput - 0.5) / 0.4;
      adjustedValue = 0.6 + Math.pow(highProgress, 1.5) * 0.3;
    }
    // 90%-100%範圍：更平緩的過渡到最大亮度
    else {
      const finalProgress = (normalizedInput - 0.9) / 0.1;
      // 使用更大的指數(2.5)使接近100%時變化極為緩慢
      const easedProgress = Math.pow(finalProgress, 2.5);
      adjustedValue = 0.9 + easedProgress * 0.1;
    }
    
    // 將結果映射回到所需的亮度範圍
    return minBrightness + (maxBrightness - minBrightness) * adjustedValue;
  };

  // 監聽亮度和色溫變化
  useEffect(() => {
    // 當亮度或色溫變化時，且不在快切模式中時，立即更新顯示亮度
    if (switch_state === "on" && !isQuickToggling) {
      // 取消任何正在進行的亮度動畫
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      // 立即應用新的亮度值
      setDisplayBrightness(adjustBrightness(brightness / 100));
    }
  }, [brightness, color_temp, switch_state, isQuickToggling]);

  // 監聽亮度和開關狀態變化，實現平滑過渡
  useEffect(() => {
    // 如果快切動畫正在進行但有亮度變化，優先響應亮度變化
    if (isQuickToggling && prevBrightness !== brightness) {
      setTempBrightness(null); // 清除臨時亮度控制
      setIsQuickToggling(false); // 結束快切動畫狀態
    }
    
    // 如果快切動畫正在進行且沒有亮度變化，則不執行一般亮度動畫
    if (isQuickToggling && prevBrightness === brightness) return;
    
    // 若為開關狀態變化
    if (prevSwitchState !== switch_state) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // 關閉時一律使用固定的亮度值
      const targetBrightness = switch_state === "off" ? offBrightness : adjustBrightness(brightness / 100);
      const startBrightness = displayBrightness;
      const startTime = performance.now();
      
      // 關閉時使用更短的動畫時間
      const duration = switch_state === "off" ? 100 : 200;
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // 調整緩動函數使視覺效果更明顯
        let easedProgress;
        
        if (switch_state === "off") {
          // 關閉時使用更快的初始變化曲線
          easedProgress = Math.pow(progress, 1/4); // 更快速的暗下來
        } else {
          // 開啟時保持原來的曲線
          if (progress < 0.5) {
            const phaseProgress = progress / 0.5;
            easedProgress = Math.pow(phaseProgress, 1/2.5) * 0.5;
          } else {
            const phaseProgress = (progress - 0.5) / 0.5;
            easedProgress = 0.5 + Math.pow(phaseProgress, 1.5) * 0.5;
          }
        }
        
        const newBrightness = startBrightness + (targetBrightness - startBrightness) * easedProgress;
        setDisplayBrightness(newBrightness);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      setPrevSwitchState(switch_state);
    } 
    // 若只是亮度變化
    else if (prevBrightness !== brightness && switch_state === "on") {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const targetBrightness = adjustBrightness(brightness / 100);
      const startBrightness = displayBrightness;
      const startTime = performance.now();
      const duration = 180; // 縮短亮度變化過渡時間
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // 使用與上面相同的緩動函數，確保一致性
        let easedProgress;
        
        if (progress < 0.5) {
          const phaseProgress = progress / 0.5;
          easedProgress = Math.pow(phaseProgress, 1/2.5) * 0.5;
        } else {
          const phaseProgress = (progress - 0.5) / 0.5;
          easedProgress = 0.5 + Math.pow(phaseProgress, 1.5) * 0.5;
        }
        
        const newBrightness = startBrightness + (targetBrightness - startBrightness) * easedProgress;
        setDisplayBrightness(newBrightness);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          animationRef.current = null;
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    setPrevBrightness(brightness);
  }, [brightness, switch_state, prevBrightness, prevSwitchState, displayBrightness, isQuickToggling]);

  // 組件卸載時清除動畫
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 決定實際顯示的亮度
  const actualBrightness = tempBrightness !== null ? tempBrightness : displayBrightness;

  return (
    <div className={styles.sceneDisplay}>
      <img
        src={imagePath}
        alt={`${scene} - ${color_temp}`}
        className={styles.sceneImage}
        style={{
          filter: `brightness(${actualBrightness})`,
          transition: isQuickToggling ? "none" : "filter 0.3s cubic-bezier(0.2, 0, 0.8, 0.2)", // 增加過渡時間
        }}
        draggable={false}
      />
    </div>
  );
};

export default SceneDisplay;