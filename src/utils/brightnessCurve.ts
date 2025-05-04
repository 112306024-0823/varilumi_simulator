/**
 * 將數字亮度(1~100)轉換為平均亮度(20~200)，模擬人眼感知的非線性曲線
 *
 * 分段設計：
 * 1%~12.5%：20~50，指數1/2.5
 * 12.5%~30%：50~90，指數0.7
 * 30%~50%：90~130，指數0.9
 * 50%~90%：130~180, 指數1.2
 * 90%~100%：180~200，指數2.5
 *
 * @param value 數字亮度 (1~100)
 * @returns 平均亮度 (20~200)
 */
export function perceptualBrightness(value: number): number {
  if (value <= 1) return 20;
  if (value >= 100) return 200;
  const percent = value / 100;

  if (percent <= 0.125) {
    // 1%~12.5%：20~50
    const t = (percent - 0.01) / (0.125 - 0.01);
    return 20 + (50 - 20) * Math.pow(Math.max(0, t), 1 / 2.5);
  } else if (percent <= 0.3) {
    // 12.5%~30%：50~90
    const t = (percent - 0.125) / (0.3 - 0.125);
    return 50 + (90 - 50) * Math.pow(t, 0.7);
  } else if (percent <= 0.5) {
    // 30%~50%：90~130
    const t = (percent - 0.3) / (0.5 - 0.3);
    return 90 + (130 - 90) * Math.pow(t, 0.9);
  } else if (percent <= 0.9) {
    // 50%~90%：130~180
    const t = (percent - 0.5) / (0.9 - 0.5);
    return 130 + (180 - 130) * Math.pow(t, 1.2);
  } else {
    // 90%~100%：180~200
    const t = (percent - 0.9) / (1 - 0.9);
    return 180 + (200 - 180) * Math.pow(t, 2.5);
  }
}

/**
 * 將平均亮度(20~200)反推回數字亮度(1~100)
 * 
 * 此函數是 perceptualBrightness 的反向計算，用於從顯示亮度反推回原始數值
 * 
 * @param avgBrightness 平均亮度 (20~200)
 * @returns 數字亮度 (1~100)
 */
export function inversePerceptualBrightness(avgBrightness: number): number {
  // 邊界處理
  if (avgBrightness <= 20) return 1;
  if (avgBrightness >= 200) return 100;

  // 分段反推
  if (avgBrightness <= 50) {
    // 20~50 => 1%~12.5%
    const normalizedBrightness = (avgBrightness - 20) / (50 - 20);
    const t = Math.pow(normalizedBrightness, 2.5);
    return 1 + (12.5 - 1) * t;
  } else if (avgBrightness <= 90) {
    // 50~90 => 12.5%~30%
    const normalizedBrightness = (avgBrightness - 50) / (90 - 50);
    const t = Math.pow(normalizedBrightness, 1 / 0.7);
    return 12.5 + (30 - 12.5) * t;
  } else if (avgBrightness <= 130) {
    // 90~130 => 30%~50%
    const normalizedBrightness = (avgBrightness - 90) / (130 - 90);
    const t = Math.pow(normalizedBrightness, 1 / 0.9);
    return 30 + (50 - 30) * t;
  } else if (avgBrightness <= 180) {
    // 130~180 => 50%~90%
    const normalizedBrightness = (avgBrightness - 130) / (180 - 130);
    const t = Math.pow(normalizedBrightness, 1 / 1.2);
    return 50 + (90 - 50) * t;
  } else {
    // 180~200 => 90%~100%
    const normalizedBrightness = (avgBrightness - 180) / (200 - 180);
    const t = Math.pow(normalizedBrightness, 1 / 2.5);
    return 90 + (100 - 90) * t;
  }
} 