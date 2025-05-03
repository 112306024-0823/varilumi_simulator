import React from "react";
import type { MethodType, FunctionType, MemoryState } from "../types";
import styles from "../styles/main.module.css";

/**
 * 功能FILTER區元件
 *
 * 提供三組按鈕：
 * 1. 調光調色方法（無段式/多段式）
 * 2. 功能類型（調光型/調色型）
 * 3. 記憶功能（ON/OFF）
 *
 * @param method_type 當前調光調色方法
 * @param function_type 當前功能類型
 * @param memory 當前記憶功能狀態
 * @param onChange 切換時回傳新狀態
 *
 * @example
 * <FilterPanel method_type="stepless" function_type="dimming" memory="off" onChange={...} />
 */
interface FilterPanelProps {
  method_type: MethodType;
  function_type: FunctionType;
  memory: MemoryState;
  onChange: (update: Partial<{
    method_type: MethodType;
    function_type: FunctionType;
    memory: MemoryState;
  }>) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  method_type,
  function_type,
  memory,
  onChange,
}) => {
  return (
    <div className={`${styles.filterPanel} ${styles.borderless}`}>
      <h3 className={styles.panelTitle}>調光/調色方法</h3>
      <div className={styles.filterGroup}>
        <button
          className={method_type === "multistep" ? `${styles.button} ${styles.active}` : styles.button}
          onClick={() => onChange({ method_type: "multistep" })}
        >
          多段式
        </button>
        <button
          className={method_type === "stepless" ? `${styles.button} ${styles.active}` : styles.button}
          onClick={() => onChange({ method_type: "stepless" })}
        >
          無段式
        </button>
      </div>
      <h3 className={styles.panelTitle}>功能類型</h3>
      <div className={styles.filterGroup}>
        <button
          className={function_type === "color" ? `${styles.button} ${styles.active}` : styles.button}
          onClick={() => onChange({ function_type: "color" })}
        >
          調色型
        </button>
        <button
          className={function_type === "dimming" ? `${styles.button} ${styles.active}` : styles.button}
          onClick={() => onChange({ function_type: "dimming" })}
        >
          調光型
        </button>
      </div>
      <h3 className={styles.panelTitle}>記憶功能</h3>
      <div className={styles.filterGroup}>
        <span 
          className={memory === "on" ? `${styles.switch} ${styles.on}` : styles.switch} 
          onClick={() => onChange({ memory: memory === "on" ? "off" : "on" })} 
          style={{ cursor: "pointer" }}
        >
          {memory === "on" ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  );
};

export default FilterPanel; 