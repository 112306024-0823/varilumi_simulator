import React, { useState } from "react";
import type { ColorTemperature, FunctionType, MethodType } from "../types";
import styles from "../styles/main.module.css";

/**
 * 功能設定區元件
 *
 * 根據 FILTER 區選擇，顯示對應的功能選項與色溫選擇。
 *
 * @param function_type 當前功能類型
 * @param method_type 當前調光調色方法
 * @param color_temp 當前色溫
 * @param onColorTempChange 切換色溫時回傳新值
 *
 * @example
 * <FunctionSettings function_type="dimming" method_type="stepless" color_temp="4000K" onColorTempChange={...} />
 */
interface FunctionSettingsProps {
  function_type: FunctionType;
  method_type: MethodType;
  color_temp: ColorTemperature;
  onColorTempChange: (color: ColorTemperature) => void;
}

const colorOptions: { label: string; value: ColorTemperature }[] = [
  { label: "白光", value: "6000K" },
  { label: "柔光", value: "4000K" },
  { label: "黃光", value: "3000K" },
];

const FunctionSettings: React.FC<FunctionSettingsProps> = ({
  function_type,
  method_type,
  color_temp,
  onColorTempChange,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // 顯示/隱藏功能說明提示
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };
  
  // 目前僅支援「無段式+調光型」組合
  if (function_type === "dimming" && method_type === "stepless") {
    return (
      <div className={styles.functionSettings}>
        <div className={styles.functionBlock}>
          <div className={styles.functionHeader}>
            <span className={styles.functionTitle}>功能設定</span>
          </div>
          
          <div className={styles.settingsContent}>
            <div className={styles.functionRow}>
              <span className={styles.functionLabel}>功能：</span>
              <div className={styles.functionValue}>
                <span>無段調光</span>
                <button 
                  className={styles.infoButton}
                  onClick={toggleTooltip}
                  aria-label="顯示功能說明"
                >
                  <span className={styles.infoIcon}>i</span>
                </button>
                
                {showTooltip && (
                  <div className={styles.tooltipBox}>
                    <p>無段調光功能說明：可藉由壁切開關調整 1-100% 的亮度。</p>
                    <button 
                      className={styles.tooltipCloseBtn} 
                      onClick={toggleTooltip}
                      aria-label="關閉說明"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles.functionRow}>
              <span className={styles.functionLabel}>色溫：</span>
              <div className={styles.colorButtons}>
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={color_temp === opt.value ? `${styles.colorButton} ${styles.active}` : styles.colorButton}
                    onClick={() => onColorTempChange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // 其他組合可日後擴充
  return (
    <div className={styles.functionSettings}>
      <span>（此組合尚未實作）</span>
    </div>
  );
};

export default FunctionSettings; 