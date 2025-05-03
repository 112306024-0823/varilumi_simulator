import React from "react";
import type { SimulatorState } from "../types";
import styles from "../styles/main.module.css";

/**
 * 狀態區元件
 *
 * 顯示目前功能、色溫、亮度、開關狀態。
 *
 * @param state 模擬器目前狀態
 *
 * @example
 * <StatusPanel state={state} />
 */
interface StatusPanelProps {
  state: SimulatorState;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ state }) => {
  return (
    <div className={styles.statusPanel}>
      <div><b>狀態：</b>{state.switch_state === "on" ? "開燈" : "關燈"}</div>
      <div>亮度 {state.brightness}%　色溫 {state.color_temp}</div>
    </div>
  );
};

export default StatusPanel; 