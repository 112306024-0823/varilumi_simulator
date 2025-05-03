import React from "react";
import styles from "../styles/main.module.css";
import type { ColorTemperature } from "../types";

/**
 * 色溫滑桿元件
 *
 * @param value 目前色溫
 * @param onChange 色溫變更時回傳新值
 *
 * @example
 * <ColorTempSlider value="4000K" onChange={setColorTemp} />
 */
interface ColorTempSliderProps {
  value: ColorTemperature;
  onChange: (val: ColorTemperature) => void;
}

// 色溫值和滑桿位置對應
const colorTempMap: { [key: string]: number } = {
  "3000K": 10,
  "4000K": 50,
  "6000K": 90
};

// 滑桿位置反向對應到色溫值
const valueToColorTemp = (value: number): ColorTemperature => {
  if (value < 30) return "3000K";
  if (value < 70) return "4000K";
  return "6000K";
};

const ColorTempSlider: React.FC<ColorTempSliderProps> = ({ value, onChange }) => {
  // 將色溫轉換為滑桿位置
  const sliderValue = colorTempMap[value] || 50;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    const newColorTemp = valueToColorTemp(newValue);
    onChange(newColorTemp);
  };

  // 色溫對應的顯示文字
  const tempLabels: { [key: string]: string } = {
    "3000K": "暖色",
    "4000K": "中性",
    "6000K": "冷色"
  };

  return (
    <div className={styles.colorTempContainer}>
      <div className={styles.sliderHeader}>
        <div className={styles.sliderLabelGroup}>
          <img src="/assets/icons/color-temp.svg" alt="色溫" className={styles.sliderIcon} />
          <label htmlFor="color-temp-slider">色溫</label>
        </div>
        <span className={styles.sliderValue}>{tempLabels[value]} ({value})</span>
      </div>
      <div className={styles.sliderWithIcons}>
        <div className={styles.tempIcon} style={{color: "#ffb74d"}}>暖</div>
        <input
          id="color-temp-slider"
          type="range"
          min={0}
          max={100}
          value={sliderValue}
          onChange={handleChange}
          className={styles.colorTempSlider}
        />
        <div className={styles.tempIcon} style={{color: "#90caf9"}}>冷</div>
      </div>
    </div>
  );
};

export default ColorTempSlider; 