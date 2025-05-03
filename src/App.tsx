import React, { useRef, useState, useEffect } from "react";
import type { SimulatorState, ColorTemperature, SceneType, SwitchState, MemoryState, FunctionType, MethodType } from "./types";
import SceneDisplay from "./components/SceneDisplay";
import FilterPanel from "./components/FilterPanel";
import FunctionSettings from "./components/FunctionSettings";
import StatusPanel from "./components/StatusPanel";
import ControlPanel from "./components/ControlPanel";
import BrightnessSlider from "./components/BrightnessSlider";
import ColorTempSlider from "./components/ColorTempSlider";
import { useLocalStorage } from "./hooks/useLocalStorage";
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
  const initialBrightness = 15;

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
    // 若正在動畫中，則取消動畫
    if (isAnimating) {
      clearAnimations();
      return;
    }
    
    setIsAnimating(true);
    
    // 先關閉
    setState((prev) => ({ ...prev, switch_state: "off" }));
    
    // 2秒後開啟，並逐漸變亮
    setTimeout(() => {
      setState((prev) => ({ ...prev, switch_state: "on", brightness: initialBrightness }));
      
      // 緩慢增亮
      let start = performance.now();
      const duration = 6000; // 六秒完成增亮過程
      
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        
        // 使用平滑的緩動函數
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        // 從初始亮度值增加到100
        const newBrightness = Math.round(initialBrightness + easedProgress * (100 - initialBrightness));
        setState((prev) => ({ ...prev, brightness: newBrightness }));
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          clearAnimations();
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }, 2000);
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