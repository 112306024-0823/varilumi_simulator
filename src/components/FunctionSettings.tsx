import React from "react";
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
  // 目前僅支援「無段式+調光型」組合
  if (function_type === "dimming" && method_type === "stepless") {
    return (
      <div className={styles.functionSettings}>
        <div>
          <span>功能：</span>
          <span>無段調光</span>
        </div>
        <div>
          <span>色溫：</span>
          {colorOptions.map((opt) => (
            <button
              key={opt.value}
              className={color_temp === opt.value ? `${styles.button} ${styles.active}` : styles.button}
              onClick={() => onColorTempChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
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