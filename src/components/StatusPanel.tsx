import React from "react";
import styles from "../styles/main.module.css";
import type { SimulatorState, MethodType, FunctionType, MemoryState } from "../types";

/**
 * 狀態顯示與控制面板元件
 *
 * 顯示目前模擬器的各項設定狀態，並允許進行設定變更。
 *
 * @param state 目前模擬器狀態
 * @param onChange 當設定變更時的回調函數
 *
 * @example
 * <StatusPanel state={simulatorState} onChange={handleChange} />
 */
interface StatusPanelProps {
  state: SimulatorState;
  onChange?: (update: Partial<{
    method_type: MethodType;
    function_type: FunctionType;
    memory: MemoryState;
  }>) => void;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ state, onChange }) => {
  // 色溫對應的顯示文字
  const tempLabels: { [key: string]: string } = {
    "3000K": "暖色",
    "4000K": "中性",
    "6000K": "冷色"
  };

  // 根據狀態選擇電源圖標
  const powerIcon = state.switch_state === "on" 
    ? "/assets/status-icons/power-on.svg" 
    : "/assets/status-icons/power-off.svg";
    
  // 處理設定變更
  const handleChange = (update: Partial<{
    method_type: MethodType;
    function_type: FunctionType;
    memory: MemoryState;
  }>) => {
    if (onChange) {
      onChange(update);
    }
  };

  return (
    <div className={`${styles.statusPanel} card status-card`}>
      <div className={styles.statusGrid}>
        {/* 第一行：基本狀態顯示 */}
        <div className={`${styles.statusItem} ${styles.statusItemEnhanced}`}>
          <div className={styles.statusLabelGroup}>
            <img src={powerIcon} alt="電源" className={styles.statusIcon} />
            <span className={styles.statusLabel}>電源</span>
          </div>
          <span className={`${styles.statusValue} ${styles.statusValueEnhanced} ${state.switch_state === "on" ? styles.statusOn : styles.statusOff}`}>
            {state.switch_state === "on" ? "開啟" : "關閉"}
          </span>
        </div>
        <div className={`${styles.statusItem} ${styles.statusItemEnhanced}`}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/brightness.svg" alt="亮度" className={styles.statusIcon} />
            <span className={styles.statusLabel}>亮度</span>
          </div>
          <span className={`${styles.statusValue} ${styles.statusValueEnhanced}`} title={`${state.brightness}%`}>
            {state.brightness}%
          </span>
        </div>
        <div className={`${styles.statusItem} ${styles.statusItemEnhanced}`}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/color-temp.svg" alt="色溫" className={styles.statusIcon} />
            <span className={styles.statusLabel}>色溫</span>
          </div>
          <span className={`${styles.statusValue} ${styles.statusValueEnhanced}`} title={`${tempLabels[state.color_temp]} (${state.color_temp})`}>
            {tempLabels[state.color_temp] || state.color_temp}
          </span>
        </div>
        
        {/* 第二行：可互動設定項目 - 使用按鈕組 */}
        <div className={`${styles.statusItem} ${styles.interactiveItem} ${styles.statusItemEnhanced}`}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/method.svg" alt="方法" className={styles.statusIcon} />
            <span className={styles.statusLabel}>方法</span>
          </div>
          <div className={styles.statusBtnGroup}>
            <button 
              className={state.method_type === "stepless" ? `${styles.statusBtn} ${styles.active} ${styles.statusBtnEnhanced}` : `${styles.statusBtn} ${styles.statusBtnEnhanced}`}
              onClick={() => handleChange({ method_type: "stepless" })}
              title="無段式"
            >
              無段
            </button>
            <button 
              className={state.method_type === "multistep" ? `${styles.statusBtn} ${styles.active} ${styles.statusBtnEnhanced}` : `${styles.statusBtn} ${styles.statusBtnEnhanced}`}
              onClick={() => handleChange({ method_type: "multistep" })}
              title="多段式"
            >
              多段
            </button>
          </div>
        </div>
        
        <div className={`${styles.statusItem} ${styles.interactiveItem} ${styles.statusItemEnhanced}`}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/function.svg" alt="功能" className={styles.statusIcon} />
            <span className={styles.statusLabel}>功能</span>
          </div>
          <div className={styles.statusBtnGroup}>
            <button 
              className={state.function_type === "dimming" ? `${styles.statusBtn} ${styles.active} ${styles.statusBtnEnhanced}` : `${styles.statusBtn} ${styles.statusBtnEnhanced}`}
              onClick={() => handleChange({ function_type: "dimming" })}
              title="調光型"
            >
              調光
            </button>
            <button 
              className={state.function_type === "color" ? `${styles.statusBtn} ${styles.active} ${styles.statusBtnEnhanced}` : `${styles.statusBtn} ${styles.statusBtnEnhanced}`}
              onClick={() => handleChange({ function_type: "color" })}
              title="調色型"
            >
              調色
            </button>
          </div>
        </div>
        
        <div className={`${styles.statusItem} ${styles.interactiveItem} ${styles.statusItemEnhanced}`}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/memory.svg" alt="記憶" className={styles.statusIcon} />
            <span className={styles.statusLabel}>記憶</span>
          </div>
          <div 
            className={state.memory === "on" ? `${styles.memoryToggle} ${styles.active} ${styles.memoryToggleEnhanced}` : `${styles.memoryToggle} ${styles.memoryToggleEnhanced}`}
            onClick={() => handleChange({ memory: state.memory === "on" ? "off" : "on" })}
            title={state.memory === "on" ? "記憶功能已開啟" : "記憶功能已關閉"}
          >
            {state.memory === "on" ? "ON" : "OFF"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel; 