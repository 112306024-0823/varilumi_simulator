/**
 * 型別定義檔，集中管理燈光模擬器的主要型別。
 */

// 色溫類型
export type ColorTemperature = "3000K" | "4000K" | "6000K";

// 場景類型
export type SceneType = "livingroom" | "bedroom" | "study" | "main";

// 壁切狀態
export type SwitchState = "on" | "off";

// 記憶功能狀態
export type MemoryState = "on" | "off";

// 功能類型
export type FunctionType = "dimming" | "color";

// 調光調色方法
export type MethodType = "stepless" | "multistep";

/**
 * 儲存模擬器目前狀態的型別。
 *
 * @property scene 場景類型
 * @property color_temp 色溫
 * @property brightness 亮度百分比 (1~100)
 * @property switch_state 壁切開關狀態
 * @property memory 記憶功能狀態
 * @property function_type 功能類型
 * @property method_type 調光/調色方法
 */
export interface SimulatorState {
  scene: SceneType;
  color_temp: ColorTemperature;
  brightness: number;
  switch_state: SwitchState;
  memory: MemoryState;
  function_type: FunctionType;
  method_type: MethodType;
} 