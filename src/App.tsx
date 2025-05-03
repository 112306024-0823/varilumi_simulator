import React, { useRef } from "react";
import type { SimulatorState, ColorTemperature, SceneType, SwitchState, MemoryState, FunctionType, MethodType } from "./types";
import SceneDisplay from "./components/SceneDisplay";
import FilterPanel from "./components/FilterPanel";
import FunctionSettings from "./components/FunctionSettings";
import StatusPanel from "./components/StatusPanel";
import ControlPanel from "./components/ControlPanel";
import BrightnessSlider from "./components/BrightnessSlider";
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
  // 亮度動畫控制
  const animationRef = useRef<number | null>(null);

  // 處理亮度滑桿
  const handleBrightnessChange = (val: number) => {
    setState((prev) => ({ ...prev, brightness: val }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  // 處理快速關開
  const handleQuickToggle = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      return;
    }
    setState((prev) => ({ ...prev, switch_state: "off", brightness: 1 }));
    setTimeout(() => {
      setState((prev) => ({ ...prev, switch_state: "on", brightness: 1 }));
      let start = performance.now();
      const duration = 6000;
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
    }, 2000);
  };

  return (
    <div className="simulator-root">
      <div className="sceneRow">
        <div className="card sceneDisplay">
          <SceneDisplay
            scene={state.scene}
            color_temp={state.color_temp}
            brightness={state.brightness}
            switch_state={state.switch_state}
            onSwitch={(sw) => setState((prev) => ({ ...prev, switch_state: sw }))}
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
            onColorTempChange={(color) => setState((prev) => ({ ...prev, color_temp: color }))}
          />
        </div>
        <div className="card">
          <BrightnessSlider
            value={state.brightness}
            onChange={handleBrightnessChange}
          />
        </div>
        <div className="card">
          <StatusPanel state={state} />
        </div>
        <div className="card">
          <ControlPanel
            switch_state={state.switch_state}
            onSwitch={(sw) => setState((prev) => ({ ...prev, switch_state: sw }))}
            onQuickToggle={handleQuickToggle}
          />
        </div>
      </div>
    </div>
  );
};

export default App;