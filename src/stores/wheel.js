import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useWheelStore = defineStore("wheel", () => {
  /**
   * 所有的数据
   */
  const items = ref([]);
  /**
   * 所有的数据的角度
   */
  const itemsAngle = ref([]);
  /**
   * 已随机的数据
   */
  const randomedItem = ref([]);
  /**
   * 未随机的数据
   */
  const notRandomedItem = ref([]);
  /**
   * 已经随机过的历史记录
   */
  const randomedHistory = ref([]);
  /**
   * 本地存储的key
   */
  const localstorageKey = "wheel_data";
  /**
   * 旋转时间
   */
  const rotateTime = ref(5);
  /**
   * 是否已经初始化数据
   */
  const isInitData = ref(false);
  /**
   * 是否正在旋转
   */
  const isRotating = ref(false);
  /**
   * 是否支持语音合成
   */
  const isSupportSpeechSynthesis = ref(false);
  /**
   * 是否正在说话
   */
  const isSpeaking = ref(false);
  /**
   * 清除已随机的历史记录
   */
  function clearRandomedHistory() {
    randomedHistory.value = [];
  }
  /**
   * 删除项
   */
  function deleteItem(index) {
    items.value.splice(index, 1);
  }

  return {
    items,
    itemsAngle,
    randomedItem,
    notRandomedItem,
    randomedHistory,
    localstorageKey,
    rotateTime,

    isInitData,
    isRotating,
    isSupportSpeechSynthesis,
    isSpeaking,

    clearRandomedHistory,
    deleteItem
  };
});
