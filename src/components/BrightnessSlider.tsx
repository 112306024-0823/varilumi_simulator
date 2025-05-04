import React, { useCallback } from "react";
import styles from "../styles/main.module.css";
import { getAssetPath } from '../utils/assetUtils';

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

const BrightnessSlider: React.FC<BrightnessSliderProps> = ({ value, onChange }) => {
  // 處理滑桿變更，優化觸發邏輯
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    onChange(newValue); // 移除条件判断，确保每次更改都觸發
  }, [onChange]);

  // 處理滑动中的變更，確保即時響應
  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const newValue = Number(target.value);
    onChange(newValue); // 在滑动过程中實時觸發更新
  }, [onChange]);

  // 處理最小/最大值圖標點擊
  const handleMinClick = useCallback(() => {
    onChange(1); // 點擊最小亮度圖標設為1%
  }, [onChange]);

  const handleMaxClick = useCallback(() => {
    onChange(100); // 點擊最大亮度圖標設為100%
  }, [onChange]);

  return (
    <div className={styles.brightnessSliderContainer}>
      <div className={styles.sliderHeader}>
        <div className={styles.sliderLabelGroup}>
          <img src={getAssetPath("/assets/icons/brightness.svg")} alt="亮度" className={styles.sliderIcon} />
          <label htmlFor="brightness-slider">亮度</label>
        </div>
        <span className={styles.sliderValue}>{value}%</span>
      </div>
      <div className={styles.sliderWithIcons}>
        <img 
          src={getAssetPath("/assets/icons/brightness.svg")} 
          alt="min" 
          className={`${styles.sliderIconSmall} ${styles.sliderIconDim}`} 
          onClick={handleMinClick}
          style={{ cursor: 'pointer' }}
          title="最小亮度"
        />
        <input
          id="brightness-slider"
          type="range"
          min={1}
          max={100}
          value={value}
          onChange={handleChange}
          onInput={handleInput}
          className={styles.brightnessSlider}
          aria-label="亮度調整"
        />
        <img 
          src={getAssetPath("/assets/icons/brightness.svg")} 
          alt="max" 
          className={styles.sliderIconSmall} 
          onClick={handleMaxClick}
          style={{ cursor: 'pointer' }}
          title="最大亮度"
        />
      </div>
    </div>
  );
};

export default BrightnessSlider;