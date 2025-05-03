import React from "react";
import styles from "../styles/main.module.css";

/**
 * 亮度滑桿元件
 *
 * @param value 目前亮度 (1~100)
 * @param onChange 亮度變更時回傳新值
 *
 * @example
 * <BrightnessSlider value={brightness} onChange={setBrightness} />
 */
interface BrightnessSliderProps {
  value: number;
  onChange: (val: number) => void;
}

const BrightnessSlider: React.FC<BrightnessSliderProps> = ({ value, onChange }) => (
  <div className={styles.brightnessSlider}>
    <label htmlFor="brightness-slider">亮度</label>
    <input
      id="brightness-slider"
      type="range"
      min={1}
      max={100}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={styles.slider}
    />
    <span>{value}%</span>
  </div>
);

export default BrightnessSlider;