import React, { useRef, useState } from "react";
import type { SceneType, ColorTemperature, SwitchState } from "../types";

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
  console.log('SceneDisplay props:', {
    scene,
    color_temp,
    brightness,
    switch_state
  });

  const [state, setState] = useState({
    brightness: brightness,
    switch_state: switch_state
  });
  // 圖片檔名規則：scene_{scene}_{color_temp}.png
  const imageName = `scene_${scene}_${color_temp}.png`;
  // 圖片路徑
  const imagePath = `/assets/images/${imageName}`;
  const switchSvg = switch_state === "on" ? "switch_on_hand.svg" : "switch_off_hand.svg";
  const switchSvgPath = `/assets/images/${switchSvg}`;

  // 確保圖片路徑正確
  console.log('Image path:', imagePath);
  console.log('Switch path:', switchSvgPath);

  // 檢查圖片是否存在
  const checkImageExists = async (path: string) => {
    try {
      const response = await fetch(path);
      console.log('Image exists:', path, response.ok);
      return response.ok;
    } catch (error) {
      console.error('Image not found:', path, error);
      return false;
    }
  };

  // 檢查圖片是否存在
  checkImageExists(imagePath);
  checkImageExists(switchSvgPath);

  // 若壁切為 off，亮度強制設為 1%
  const displayBrightness = switch_state === "off" ? 0.01 : brightness / 100;

  // 亮度動畫控制
  const animationRef = useRef<number | null>(null);

  // 處理亮度滑桿
  const handleBrightnessChange = (val: number) => {
    // 更新亮度
    onQuickToggle?.();
    // 觸發亮度動畫
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    const start = performance.now();
    const duration = 500; // 動畫時間 500ms
    const animate = (now: number) => {
      const elapsed = now - start;
      const percent = Math.min(1, elapsed / duration);
      const newBrightness = Math.round(1 + percent * (val - 1));
      setState((prev) => ({ ...prev, brightness: newBrightness }));
      if (percent < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // 處理快速關開
  const handleQuickToggle = () => {
    // 若已在動畫中，則中斷動畫
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      return;
    }
    // 觸發壁切動畫
    setState((prev) => ({ ...prev, switch_state: prev.switch_state === "on" ? "off" : "on" }));
    // 觸發亮度動畫
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    const start = performance.now();
    const duration = 1000; // 動畫時間 1000ms
    const animate = (now: number) => {
      const elapsed = now - start;
      const percent = Math.min(1, elapsed / duration);
      const newBrightness = Math.round(1 + percent * 99);
      setState((prev) => ({ ...prev, brightness: newBrightness }));
      if (percent < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="sceneDisplay" style={{ position: "relative" }}>
      <img
        src={imagePath}
        alt={`${scene} - ${color_temp}`}
        style={{
          width: "100%",
          height: "auto",
          filter: `brightness(${displayBrightness})`,
          transition: "filter 0.5s cubic-bezier(0.4,0,0.2,1)",
          objectFit: "contain",
        }}
        draggable={false}
      />
      <div className="wallSwitchOverlayGroup" style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px"
      }}>
        <img
          src={switchSvgPath}
          alt="壁切開關"
          className="wallSwitchOverlay"
          onClick={() => onSwitch && onSwitch(switch_state === "on" ? "off" : "on")}
          draggable={false}
          style={{
            width: "60px",
            height: "60px",
            cursor: "pointer"
          }}
        />
        <button
          className="quickToggleBtnOverlay"
          onClick={onQuickToggle}
          style={{
            padding: "8px 16px",
            background: "#f9c784",
            color: "#222",
            border: "none",
            borderRadius: "24px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold"
          }}
        >
          快速關開
        </button>
      </div>
    </div>
  );
};

export default SceneDisplay;