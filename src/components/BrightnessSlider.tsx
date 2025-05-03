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
  <div className={styles.brightnessSliderContainer}>
    <div className={styles.sliderHeader}>
      <div className={styles.sliderLabelGroup}>
        <img src="/assets/icons/brightness.svg" alt="亮度" className={styles.sliderIcon} />
        <label htmlFor="brightness-slider">亮度</label>
      </div>
      <span className={styles.sliderValue}>{value}%</span>
    </div>
    <div className={styles.sliderWithIcons}>
      <img src="/assets/icons/brightness.svg" alt="min" className={`${styles.sliderIconSmall} ${styles.sliderIconDim}`} />
      <input
        id="brightness-slider"
        type="range"
        min={1}
        max={100}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={styles.brightnessSlider}
      />
      <img src="/assets/icons/brightness.svg" alt="max" className={styles.sliderIconSmall} />
    </div>
  </div>
);

export default BrightnessSlider;