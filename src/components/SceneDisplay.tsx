import React, { useRef, useState, useEffect } from "react";
import type { SceneType, ColorTemperature, SwitchState } from "../types";
import styles from "../styles/main.module.css";
import { getAssetPath, cubicBezier } from '../utils/assetUtils';

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
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({
  scene,
  color_temp,
  brightness,
  switch_state,
  onSwitch,
  onQuickToggle,
}) => {
  // 設定關閉時的最低亮度值為0.15 (15%)，這樣可以隱約看到場景
  const minBrightness = 0.15;  
  const [displayBrightness, setDisplayBrightness] = useState(switch_state === "off" ? minBrightness : brightness / 100);
  const [prevBrightness, setPrevBrightness] = useState(brightness);
  const [prevSwitchState, setPrevSwitchState] = useState(switch_state);
  const animationRef = useRef<number | null>(null);

  // 圖片檔名規則：scene_{scene}_{color_temp}.png
  const imageName = `scene_${scene}_${color_temp}.png`;
  // 圖片路徑
  const imagePath = getAssetPath(`/assets/images/${imageName}`);
  const switchSvg = switch_state === "on" ? "switch_on_hand.svg" : "switch_off_hand.svg";
  const switchSvgPath = getAssetPath(`/assets/images/${switchSvg}`);

  // 提取共用的亮度調整函數
  const adjustBrightness = (value: number): number => {
    // 低亮度映射：在低亮度下提供更明顯的視覺效果
    
    // 確定12.5%的亮度臨界點（1/8）
    const lowThreshold = 0.125;
    
    if (value <= lowThreshold) {
      // 低亮度區域（0-12.5%）：進行強映射，使視覺效果更明顯
      // 將 0-12.5% 映射到 15-40% 的顯示亮度範圍
      // 使用非線性映射使視覺變化更加明顯
      
      // 正規化到 0-1 範圍
      const normalizedValue = value / lowThreshold;
      
      // 使用立方根函數提升低值的映射效果（更明顯）
      const enhancedValue = Math.pow(normalizedValue, 1/3);
      
      // 映射到 15-40% 範圍
      return 0.15 + enhancedValue * 0.25;
    } else if (value <= 0.5) {
      // 中亮度區域（12.5%-50%）：漸進映射，平滑過渡
      // 從40%漸變到70%
      
      // 正規化到 0-1 範圍
      const normalizedValue = (value - lowThreshold) / (0.5 - lowThreshold);
      
      // 線性映射到 40-70% 範圍
      return 0.4 + normalizedValue * 0.3;
    } else {
      // 高亮度區域（50%-100%）：輕微增強
      // 從70%漸變到100%
      
      // 正規化到 0-1 範圍
      const normalizedValue = (value - 0.5) / 0.5;
      
      // 使用平方函數減弱高值的映射效果（不那麼明顯）
      const reducedValue = normalizedValue * normalizedValue;
      
      // 映射到 70-100% 範圍
      return 0.7 + reducedValue * 0.3;
    }
  };

  // 監聽色溫變化
  useEffect(() => {
    // 當色溫變化時，不需要動畫過渡，直接更新
    if (switch_state === "on") {
      setDisplayBrightness(adjustBrightness(brightness / 100));
    }
  }, [color_temp, brightness]);

  // 監聽亮度和開關狀態變化，實現平滑過渡
  useEffect(() => {
    // 若為開關狀態變化
    if (prevSwitchState !== switch_state) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const targetBrightness = switch_state === "off" ? minBrightness : adjustBrightness(brightness / 100);
      const startBrightness = displayBrightness;
      const startTime = performance.now();
      
      // 關閉時使用較短的過渡時間(150ms)，讓暗下來的效果更明顯
      // 開啟時使用正常過渡時間(300ms)，提供更平滑的視覺感受
      const duration = switch_state === "off" ? 150 : 300;
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // 同樣使用「前期慢但視覺效果明顯，後期快但視覺效果不明顯」的曲線
        let easedProgress;
        
        if (progress < 0.3) {
          // 前30%時間，完成變化的30%
          const phaseProgress = progress / 0.3;
          // 使用立方根函數使低值變化更明顯
          easedProgress = Math.pow(phaseProgress, 1/3) * 0.3;
        } else {
          // 後70%時間，完成變化的70%
          const phaseProgress = (progress - 0.3) / 0.7;
          // 使用平方函數使高值變化不太明顯
          easedProgress = 0.3 + Math.pow(phaseProgress, 2) * 0.7;
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
      const duration = 200; // 亮度變化過渡時間適當設置
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // 使用與上面相同的緩動函數，確保一致性
        let easedProgress;
        
        if (progress < 0.3) {
          // 前30%時間，完成變化的30%
          const phaseProgress = progress / 0.3;
          // 使用立方根函數使低值變化更明顯
          easedProgress = Math.pow(phaseProgress, 1/3) * 0.3;
        } else {
          // 後70%時間，完成變化的70%
          const phaseProgress = (progress - 0.3) / 0.7;
          // 使用平方函數使高值變化不太明顯
          easedProgress = 0.3 + Math.pow(phaseProgress, 2) * 0.7;
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
  }, [brightness, switch_state, prevBrightness, prevSwitchState, displayBrightness]);

  // 組件卸載時清除動畫
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.sceneDisplay}>
      <img
        src={imagePath}
        alt={`${scene} - ${color_temp}`}
        style={{
          width: "100%",
          height: "auto",
          filter: `brightness(${displayBrightness})`,
          transition: "filter 0.3s cubic-bezier(0.4, 0.2, 0.8, 0.6)",
          objectFit: "contain",
        }}
        draggable={false}
      />
      <div className={styles.wallSwitchContainer}>
        <div className={styles.switchWrapper}>
          <img
            src={switchSvgPath}
            alt="壁切開關"
            className={styles.wallSwitchOverlay}
            onClick={() => onSwitch && onSwitch(switch_state === "on" ? "off" : "on")}
            draggable={false}
          />
          <button
            className={styles.quickToggleBtnOverlay}
            onClick={onQuickToggle}
          >
            快速
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneDisplay;