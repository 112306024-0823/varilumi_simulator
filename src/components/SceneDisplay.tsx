import React, { useRef, useState, useEffect } from "react";
import type { SceneType, ColorTemperature, SwitchState } from "../types";
import styles from "../styles/main.module.css";

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
  const imagePath = `/assets/images/${imageName}`;
  const switchSvg = switch_state === "on" ? "switch_on_hand.svg" : "switch_off_hand.svg";
  const switchSvgPath = `/assets/images/${switchSvg}`;

  // 監聽色溫變化
  useEffect(() => {
    // 當色溫變化時，不需要動畫過渡，直接更新
    if (switch_state === "on") {
      setDisplayBrightness(brightness / 100);
    }
  }, [color_temp]);

  // 監聽亮度和開關狀態變化，實現平滑過渡
  useEffect(() => {
    // 若為開關狀態變化
    if (prevSwitchState !== switch_state) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      const targetBrightness = switch_state === "off" ? minBrightness : brightness / 100;
      const startBrightness = displayBrightness;
      const startTime = performance.now();
      const duration = 600; // 開關狀態變化時的過渡持續時間
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // 使用 easeInOutCubic 緩動函數讓變化更自然
        const easeProgress = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const newBrightness = startBrightness + (targetBrightness - startBrightness) * easeProgress;
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
      
      const targetBrightness = brightness / 100;
      const startBrightness = displayBrightness;
      const startTime = performance.now();
      const duration = 250; // 一般亮度變化時的過渡持續時間較短
      
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // 使用 easeOutQuad 緩動函數讓變化更自然
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        
        const newBrightness = startBrightness + (targetBrightness - startBrightness) * easeProgress;
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
          transition: "filter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
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