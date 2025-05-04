import React, { useState, useEffect, useRef } from "react";
import { SwitchState } from "../types";
import styles from "../styles/main.module.css";
import { getAssetPath } from '../utils/assetUtils';

/**
 * 壁切開關元件
 *
 * 根據開關狀態顯示對應的壁切圖片，並處理壁切開關和快速關開功能。
 *
 * @param switch_state 壁切開關狀態
 * @param onSwitch 壁切開關狀態變更時的處理函數
 * @param onQuickToggle 快速關開的處理函數
 *
 * @example
 * <WallSwitch switch_state="on" onSwitch={handleSwitch} onQuickToggle={handleQuickToggle} />
 */
interface WallSwitchProps {
  switch_state: SwitchState;
  onSwitch?: (state: SwitchState) => void;
  onQuickToggle?: () => void;
}

// 創建一個可在組件外部訪問的事件發射器，用於同步動畫
type SyncEventCallback = (action: string) => void;
const syncEvents: SyncEventCallback[] = [];

// 導出同步函數以供其他組件使用
export const registerSyncEvent = (callback: SyncEventCallback) => {
  syncEvents.push(callback);
  return () => {
    const index = syncEvents.indexOf(callback);
    if (index !== -1) {
      syncEvents.splice(index, 1);
    }
  };
};

// 觸發同步事件
const triggerSyncEvent = (action: string) => {
  syncEvents.forEach(callback => callback(action));
};

// 動畫持續時間常量
const ANIMATION_DURATION = 1000; // 確保與SceneDisplay.tsx中的值一致
// 防抖動時間設置為較短時間，允許用戶在整個漸亮過程中再次點擊
const DEBOUNCE_TIME = 600; // 減少防抖時間，以便在漸亮過程中能夠再次點擊

const WallSwitch: React.FC<WallSwitchProps> = ({
  switch_state,
  onSwitch,
  onQuickToggle,
}) => {
  // 追蹤快切按鈕是否被點擊
  const [isQuickToggling, setIsQuickToggling] = useState(false);
  // 使用ref來追踪上次快切時間，避免連續快速點擊
  const lastQuickToggleTime = useRef<number>(0);
  // 追蹤快切過程中的內部狀態，用於決定顯示哪個圖片
  const [internalSwitchState, setInternalSwitchState] = useState<SwitchState>(switch_state);
  // 追踪是否有動畫正在進行
  const animationInProgress = useRef<boolean>(false);
  
  // 更新內部狀態以匹配外部狀態
  useEffect(() => {
    setInternalSwitchState(switch_state);
    
    // 如果外部開關狀態改變，可能是快切動畫結束
    if (!isQuickToggling) {
      // 在漸亮過程中，允許再次點擊按鈕
      setTimeout(() => {
        animationInProgress.current = false;
      }, 1000); // 延遲1秒後允許再次點擊
    }
  }, [switch_state, isQuickToggling]);
  
  // 選擇對應的壁切圖片
  const switchSvg = isQuickToggling
    ? (internalSwitchState === "on" ? "switch_on_hand.svg" : "switch_off_hand.svg")
    : "switch.svg";
    
  console.log(`當前圖片: ${switchSvg}, 狀態: ${internalSwitchState}, 快切中: ${isQuickToggling}`);
    
  const switchSvgPath = getAssetPath(`/assets/images/${switchSvg}`);
  
  // 處理快切按鈕點擊
  const handleQuickToggle = () => {
    if (!onQuickToggle) return;
    
    // 防抖動：避免頻繁連續點擊
    const now = Date.now();
    if (now - lastQuickToggleTime.current < DEBOUNCE_TIME) return;
    
    // 標記時間戳以防止連續點擊
    lastQuickToggleTime.current = now;
    
    // 如果是在漸亮過程中，則允許再次點擊
    const isInBrightnessAnimation = animationInProgress.current && !isQuickToggling;
    
    // 只有在非漸亮動畫時才阻擋後續點擊
    if (!isInBrightnessAnimation) {
      animationInProgress.current = true;
    }
    
    // 設置內部狀態為關閉，顯示關閉手按圖片
    setInternalSwitchState("off");
    
    // 觸發快切事件，進行一次關-開的動畫
    triggerSyncEvent('quick-toggle-start');
    
    // 顯示按下效果
    setIsQuickToggling(true);
    
    // 調用父組件提供的快切功能
    onQuickToggle();
    
    // 設定延遲，在適當時間後恢復按鈕狀態
    setTimeout(() => {
      setInternalSwitchState("on");
      setIsQuickToggling(false);
      
      // 在漸亮過程中允許再次點擊
      if (!isInBrightnessAnimation) {
        animationInProgress.current = false;
      }
      
      triggerSyncEvent('quick-toggle-end');
    }, ANIMATION_DURATION); // 使用動畫持續時間常量
  };

  // 處理壁切開關點擊
  const handleSwitchClick = () => {
    if (!onSwitch) return;
    
    // 更新內部狀態
    const newState = switch_state === "on" ? "off" : "on";
    setInternalSwitchState(newState);
    
    // 調用外部處理函數
    onSwitch(newState);
  };

  return (
    <div className={styles.wallSwitchContainer}>
      <h3 className={styles.wallSwitchTitle}>壁切開關</h3>
      <div className={styles.switchWrapper}>
        {/* ON 標籤，亮度依據開關狀態變化 */}
        <div className={`${styles.switchLabel} ${styles.switchLabelOn} ${internalSwitchState === "on" ? styles.switchLabelActive : ""}`}>
          ON
        </div>
        
        {/* 壁切開關圖片 */}
        <div className={styles.switchImageContainer}>
          <img
            src={switchSvgPath}
            alt="壁切開關"
            className={`${styles.wallSwitchOverlay} ${isQuickToggling ? styles.quickToggleAnimation : ''}`}
            onClick={handleSwitchClick}
            draggable={false}
          />
        </div>
        
        {/* OFF 標籤，亮度依據開關狀態變化 */}
        <div className={`${styles.switchLabel} ${styles.switchLabelOff} ${internalSwitchState === "off" ? styles.switchLabelActive : ""}`}>
          OFF
        </div>
        
        {/* 快切按鈕 */}
        {onQuickToggle && (
          <button
            className={styles.quickToggleBtnOverlay}
            onClick={handleQuickToggle}
          >
            <span className={styles.quickToggleIcon}>⚡</span>
            快切
          </button>
        )}
      </div>
    </div>
  );
};

export default WallSwitch; 