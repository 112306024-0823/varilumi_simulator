import React, { useRef, useState, useEffect } from "react";
import type { SimulatorState, ColorTemperature, SwitchState } from "./types";
import SceneDisplay from "./components/SceneDisplay";
import FunctionSettings from "./components/FunctionSettings";
import StatusPanel from "./components/StatusPanel";
import BrightnessSlider from "./components/BrightnessSlider";
import ColorTempSlider from "./components/ColorTempSlider";
import WallSwitch from "./components/WallSwitch";
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
  // 記錄快切前的亮度值
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const brightnessBeforeToggle = useRef(state.brightness);

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
    // 清除快切相關的動畫
    if (isAnimating) {
      clearAnimations();
    }
    
    // 如果當前是關閉狀態，則改為開啟狀態並設置亮度
    if (state.switch_state === "off") {
      setState((prev) => ({ 
        ...prev, 
        switch_state: "on", 
        brightness: val 
      }));
    } else {
      // 否則只更新亮度值
    setState((prev) => ({ ...prev, brightness: val }));
    }
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
      
      // 在漸變過程中再次點擊時，鎖定當前亮度
      // 保持現有開關狀態和亮度值
      setState((prev) => ({ 
        ...prev, 
        switch_state: "on",
        // 不修改亮度，保持當前亮度
      }));
      
      return;
    }
    
    // 標記動畫開始
    setIsAnimating(true);
    
    // 先關閉 - 壁切關閉畫面暗下來
    setState((prev) => ({ ...prev, switch_state: "off" }));
    
    // 短暫延遲後開啟，並設為初始亮度1%
    setTimeout(() => {
      // 壁切開啟，畫面亮起來到1%，然後開始漸亮過程
      setState((prev) => ({ ...prev, switch_state: "on", brightness: 1 }));
      
      // 在1%亮度停留0.8秒，再開始漸變動畫
      setTimeout(() => {
        // 緩慢增亮
        let start = performance.now();
        const duration = 6000; // 確保整個過程是6秒
        
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(1, elapsed / duration);
          
          // 使用與SceneDisplay中相同的分段函數，讓不同亮度範圍有不同的變化曲線
          let curvedProgress;
          
          // 前1/8的進度其速率為1/3
          const firstSegment = 0.125; // 1/8
          
          if (progress <= firstSegment) {
            // 前1/8的進度，速率為原來的1/3
            curvedProgress = (progress / firstSegment) * (firstSegment / 3);
          }
          // 1/8到30%範圍：逐漸加速
          else if (progress <= 0.3) {
            const startVal = firstSegment / 3;
            const segmentProgress = (progress - firstSegment) / (0.3 - firstSegment);
            const adjustedSegment = Math.pow(segmentProgress, 0.7); // 稍微加速
            curvedProgress = startVal + (0.4 - startVal) * adjustedSegment;
          }
          // 30%-50%範圍：中速區域
          else if (progress <= 0.5) {
            const transitionProgress = (progress - 0.3) / 0.2;
            curvedProgress = 0.4 + Math.pow(transitionProgress, 0.8) * 0.2;
          }
          // 50%-90%範圍：變化越來越不明顯
          else if (progress <= 0.9) {
            const highProgress = (progress - 0.5) / 0.4;
            curvedProgress = 0.6 + Math.pow(highProgress, 1.5) * 0.3;
          }
          // 90%-100%範圍：更平緩的過渡到最大亮度
          else {
            const finalProgress = (progress - 0.9) / 0.1;
            // 使用更大的指數(2.5)使接近100%時變化極為緩慢
            const easedProgress = Math.pow(finalProgress, 2.5);
            curvedProgress = 0.9 + easedProgress * 0.1;
          }
          
          // 映射到亮度範圍 1% - 100%
          const brightnessValue = 1 + curvedProgress * 99;
          
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
      }, 800); // 在1%亮度停留0.8秒
    }, 300); // 短暫延遲後開啟
  };

  // 移動版布局
  if (isMobile) {
    return (
      <div className="simulator-root">
        {/* 狀態面板 - 整合篩選功能 */}
        <StatusPanel 
          state={state} 
          onChange={(update) => setState(prev => ({ ...prev, ...update }))}
        />
        
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
        
        {/* 壁切開關區 */}
        <div className="card wallSwitchContainer">
          <WallSwitch
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
      </div>
    );
  }

  // 桌面版布局
  return (
    <div className="simulator-root">
      {/* 狀態面板 - 整合篩選功能 */}
      <StatusPanel 
        state={state} 
        onChange={(update) => setState(prev => ({ ...prev, ...update }))}
      />
      
      {/* 場景與壁切開關區 */}
      <div className="sceneRow">
        {/* 場景顯示區 */}
        <SceneDisplay
          scene={state.scene}
          color_temp={state.color_temp}
          brightness={state.brightness}
          switch_state={state.switch_state}
          onSwitch={handleSwitchChange}
          onQuickToggle={handleQuickToggle}
        />
        
        {/* 壁切開關區 */}
        <div className="rightPanel">
        <WallSwitch
          switch_state={state.switch_state}
          onSwitch={handleSwitchChange}
          onQuickToggle={handleQuickToggle}
        />
        </div>
      </div>
      
      {/* 控制區塊 */}
      <div className="controlsRow">
        {/* 功能設定區 */}
        <div className="card functionSettingsCard">
        <FunctionSettings
          function_type={state.function_type}
          method_type={state.method_type}
          color_temp={state.color_temp}
          onColorTempChange={handleColorTempChange}
        />
        </div>
        
        {/* 亮度與色溫控制區 */}
        <div className="card slidersCard">
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
      </div>
    </div>
  );
};

export default App;