import { defineStore } from "pinia";
import { getLocalSettings, setLocalSettings } from "../utils";

export const useSettingStore = defineStore("setting", {
  state: () => {
    return {
      /**
       * 转盘旋转时间（单位：秒）
       * @type {number}
       */
      wheelRotateTime: 5
    };
  },
  actions: {
    /**
     * 初始化
     */
    init() {
      const localSettings = getLocalSettings("setting");
      Object.keys(localSettings).forEach((key) => {
        this[key] = localSettings[key];
      });
    },

    /**
     * 设置转盘旋转时间
     */
    setWheelRotateTime(time) {
      this.wheelRotateTime = time;
      setLocalSettings("setting", "wheelRotateTime", this.wheelRotateTime);
    }
  }
});
