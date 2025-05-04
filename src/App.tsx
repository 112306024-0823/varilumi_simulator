import React, { useRef, useState, useEffect } from "react";
import type { SimulatorState, ColorTemperature, SwitchState } from "./types";
import SceneDisplay from "./components/SceneDisplay";
import FilterPanel from "./components/FilterPanel";
import FunctionSettings from "./components/FunctionSettings";
import StatusPanel from "./components/StatusPanel";
import BrightnessSlider from "./components/BrightnessSlider";
import ColorTempSlider from "./components/ColorTempSlider";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { getAssetPath, cubicBezier } from "./utils/assetUtils";
import "./styles/global.css";

/**
 * 主元件：燈光功能模擬器
 *
 * 管理所有狀態，並組合各區塊元件。
 */
const defaultState: SimulatorState = {
  scene: "livingroom",
  color_temp: "4000K",
  brightness: 100,
  switch_state: "on",
  memory: "off",
  function_type: "dimming",
  method_type: "stepless",
};

const App: React.FC = () => {
  // 使用本地儲存
  const [state, setState] = useLocalStorage<SimulatorState>("simulator", defaultState);
  // 動畫控制
  const animationRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  // 響應式狀態
  const [isMobile, setIsMobile] = useState(false);

  // 關閉狀態的初始亮度值
  const initialBrightness = 1;

  // 檢測窗口尺寸變化
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // 初始檢測
    checkScreenSize();
    
    // 監聽窗口尺寸變化
    window.addEventListener('resize', checkScreenSize);
    
    // 清理監聽器
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 清除所有進行中的動畫
  const clearAnimations = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsAnimating(false);
  };

  // 組件卸載時清除動畫
  useEffect(() => {
    return clearAnimations;
  }, []);

  // 處理亮度滑桿
  const handleBrightnessChange = (val: number) => {
    // 若壁切關閉狀態，則不允許調整亮度
    if (state.switch_state === "off") return;
    
    clearAnimations();
    setState((prev) => ({ ...prev, brightness: val }));
  };

  // 處理色溫變更
  const handleColorTempChange = (temp: ColorTemperature) => {
    setState((prev) => ({ ...prev, color_temp: temp }));
  };

  // 處理開關狀態變更
  const handleSwitchChange = (newState: SwitchState) => {
    clearAnimations();
    
    if (newState === "off") {
      setState((prev) => ({ ...prev, switch_state: "off" }));
    } else {
      setState((prev) => ({ ...prev, switch_state: "on" }));
    }
  };

  // 處理快速關開
  const handleQuickToggle = () => {
    // 若正在動畫中，則取消動畫並鎖定當前亮度
    if (isAnimating) {
      clearAnimations();
      
      // 在漸變過程中再次點擊時，增加壁切開關動畫效果
      // 先關閉壁切
      setState((prev) => ({ ...prev, switch_state: "off" }));
      
      // 很短的延遲後再開啟壁切，產生切換效果
      setTimeout(() => {
        setState((prev) => ({ ...prev, switch_state: "on" }));
      }, 150);
      
      return;
    }
    
    setIsAnimating(true);
    
    // 先關閉 - 壁切關閉畫面暗下來
    setState((prev) => ({ ...prev, switch_state: "off" }));
    
    // 0.5秒後開啟，並設為初始亮度1%
    setTimeout(() => {
      // 壁切開啟，畫面亮起來到1%
      setState((prev) => ({ ...prev, switch_state: "on", brightness: initialBrightness }));
      
      // 在1%亮度停頓1秒後，再開始漸變動畫
      setTimeout(() => {
        // 緩慢增亮
        let start = performance.now();
        const duration = 6000; // 六秒完成增亮過程
        
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(1, elapsed / duration);
          
          // 亮度變化曲線：前期（約前30%時間）亮度值變化緩慢（完成1/8亮度變化）但視覺效果明顯
          // 後期（約70%時間）亮度值變化快速（完成剩餘7/8亮度變化）但視覺效果不太明顯
          
          // 設計亮度曲線：
          // 1. 前30%時間只完成12.5%的亮度值變化（1/8）
          // 2. 後70%時間完成87.5%的亮度值變化（7/8）
          let brightnessValue;
          
          if (progress < 0.3) {
            // 前30%時間，慢慢增加到12.5%的亮度值（初始亮度 + 12.5%的變化量）
            const phaseProgress = progress / 0.3; // 0-1範圍
            // 使用緩入函數使變化更平滑
            const easedPhaseProgress = phaseProgress * phaseProgress; // 平方緩入
            
            // 完成總亮度變化的1/8
            brightnessValue = initialBrightness + easedPhaseProgress * (100 - initialBrightness) * 0.125;
          } else {
            // 後70%時間，從12.5%快速增加到100%的亮度值
            const phaseProgress = (progress - 0.3) / 0.7; // 0-1範圍
            // 使用緩出函數使變化更平滑
            const easedPhaseProgress = 1 - (1 - phaseProgress) * (1 - phaseProgress); // 平方緩出
            
            // 從12.5%增加到100%（完成剩餘的7/8亮度變化）
            const startPhase2 = initialBrightness + (100 - initialBrightness) * 0.125;
            const remainingChange = (100 - initialBrightness) * 0.875;
            brightnessValue = startPhase2 + easedPhaseProgress * remainingChange;
          }
          
          // 設置新亮度值（取整）
          const newBrightness = Math.round(brightnessValue);
          setState((prev) => ({ ...prev, brightness: newBrightness }));
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            clearAnimations();
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      }, 1000); // 停頓1秒
    }, 500);
  };

  // 移動版布局
  if (isMobile) {
    return (
      <div className="simulator-root">
        {/* 狀態面板 */}
        <StatusPanel state={state} />
        
        {/* 場景顯示區 */}
        <div className="card sceneDisplay">
          <SceneDisplay
            scene={state.scene}
            color_temp={state.color_temp}
            brightness={state.brightness}
            switch_state={state.switch_state}
            onSwitch={handleSwitchChange}
            onQuickToggle={handleQuickToggle}
          />
        </div>
        
        {/* 亮度與色溫滑桿 */}
        <div className="card">
          <div className="controlsContainer">
            <BrightnessSlider
              value={state.brightness}
              onChange={handleBrightnessChange}
            />
            <ColorTempSlider
              value={state.color_temp}
              onChange={handleColorTempChange}
            />
          </div>
        </div>
        
        {/* 功能設定 */}
        <div className="card">
          <FunctionSettings
            function_type={state.function_type}
            method_type={state.method_type}
            color_temp={state.color_temp}
            onColorTempChange={handleColorTempChange}
          />
        </div>
        
        {/* 過濾面板 */}
        <div className="card filterPanel">
          <FilterPanel
            method_type={state.method_type}
            function_type={state.function_type}
            memory={state.memory}
            onChange={(update) => setState((prev) => ({ ...prev, ...update }))}
          />
        </div>
      </div>
    );
  }

  // 桌面版布局
  return (
    <div className="simulator-root">
      {/* 狀態列 - 移到最上方並簡化結構 */}
      <StatusPanel state={state} />
      
      <div className="sceneRow">
        <div className="card sceneDisplay">
          <SceneDisplay
            scene={state.scene}
            color_temp={state.color_temp}
            brightness={state.brightness}
            switch_state={state.switch_state}
            onSwitch={handleSwitchChange}
            onQuickToggle={handleQuickToggle}
          />
        </div>
        <div className="card filterPanel">
          <FilterPanel
            method_type={state.method_type}
            function_type={state.function_type}
            memory={state.memory}
            onChange={(update) => setState((prev) => ({ ...prev, ...update }))}
          />
        </div>
      </div>
      <div className="rightPanel">
        <div className="card">
          <FunctionSettings
            function_type={state.function_type}
            method_type={state.method_type}
            color_temp={state.color_temp}
            onColorTempChange={handleColorTempChange}
          />
        </div>
        <div className="card">
          <ColorTempSlider
            value={state.color_temp}
            onChange={handleColorTempChange}
          />
        </div>
        <div className="card">
          <BrightnessSlider
            value={state.brightness}
            onChange={handleBrightnessChange}
          />
        </div>
      </div>
    </div>
  );
};

export default App;