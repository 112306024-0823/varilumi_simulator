import React from "react";
import styles from "../styles/main.module.css";
import type { SimulatorState } from "../types";

/**
 * 狀態顯示面板元件
 *
 * 顯示目前模擬器的各項設定狀態。
 *
 * @param state 目前模擬器狀態
 *
 * @example
 * <StatusPanel state={simulatorState} />
 */
interface StatusPanelProps {
  state: SimulatorState;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ state }) => {
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

  return (
    <div className={`${styles.statusPanel} card status-card`}>
      <div className={styles.statusGrid}>
        <div className={styles.statusItem}>
          <div className={styles.statusLabelGroup}>
            <img src={powerIcon} alt="電源" className={styles.statusIcon} />
            <span className={styles.statusLabel}>電源</span>
          </div>
          <span className={`${styles.statusValue} ${state.switch_state === "on" ? styles.statusOn : styles.statusOff}`}>
            {state.switch_state === "on" ? "開啟" : "關閉"}
          </span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/brightness.svg" alt="亮度" className={styles.statusIcon} />
            <span className={styles.statusLabel}>亮度</span>
          </div>
          <span className={styles.statusValue} title={`${state.brightness}%`}>
            {state.brightness}%
          </span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/color-temp.svg" alt="色溫" className={styles.statusIcon} />
            <span className={styles.statusLabel}>色溫</span>
          </div>
          <span className={styles.statusValue} title={`${tempLabels[state.color_temp]} (${state.color_temp})`}>
            {tempLabels[state.color_temp] || state.color_temp}
          </span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/method.svg" alt="方法" className={styles.statusIcon} />
            <span className={styles.statusLabel}>方法</span>
          </div>
          <span className={`${styles.statusValue} ${styles.methodValue}`} title={state.method_type === "stepless" ? "無段式" : "多段式"}>
            {state.method_type === "stepless" ? "無段式" : "多段式"}
          </span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/function.svg" alt="功能" className={styles.statusIcon} />
            <span className={styles.statusLabel}>功能</span>
          </div>
          <span className={`${styles.statusValue} ${styles.functionValue}`} title={state.function_type === "dimming" ? "調光型" : "調色型"}>
            {state.function_type === "dimming" ? "調光型" : "調色型"}
          </span>
        </div>
        <div className={styles.statusItem}>
          <div className={styles.statusLabelGroup}>
            <img src="/assets/icons/memory.svg" alt="記憶" className={styles.statusIcon} />
            <span className={styles.statusLabel}>記憶</span>
          </div>
          <span className={`${styles.statusValue} ${state.memory === "on" ? styles.memoryOn : styles.memoryOff}`}>
            {state.memory === "on" ? "開啟" : "關閉"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatusPanel; 