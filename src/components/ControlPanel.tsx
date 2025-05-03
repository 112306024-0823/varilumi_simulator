import React from "react";
import type { SwitchState } from "../types";
import styles from "../styles/main.module.css";

/**
 * 操作區元件
 *
 * 提供快速關開、壁切 ON/OFF 按鈕，並顯示壁切 SVG。
 *
 * @param switch_state 當前壁切狀態
 * @param onSwitch 切換壁切狀態
 * @param onQuickToggle 觸發快速關開
 *
 * @example
 * <ControlPanel switch_state="on" onSwitch={...} onQuickToggle={...} />
 */
interface ControlPanelProps {
  switch_state: SwitchState;
  onSwitch: (state: SwitchState) => void;
  onQuickToggle: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  switch_state,
  onSwitch,
  onQuickToggle,
}) => {
  // SVG 路徑根據 switch_state 切換
  const svgName = switch_state === "on" ? "switch_on_hand.svg" : "switch_off_hand.svg";
  const svgPath = `/assets/images/${svgName}`;

  return (
    <div className={styles.controlPanel}>
      <button onClick={onQuickToggle} className={styles.quickToggleBtn}>
        快速關開
      </button>
      <button
        onClick={() => onSwitch(switch_state === "on" ? "off" : "on")}
        className={styles.switchBtn}
      >
        {switch_state === "on" ? "壁切 OFF" : "壁切 ON"}
      </button>
      <div className={styles.switchSvg}>
        <img src={svgPath} alt="壁切開關" draggable={false} />
      </div>
    </div>
  );
};

export default ControlPanel; 