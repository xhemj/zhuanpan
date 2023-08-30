import { ref } from "vue";
import { defineStore } from "pinia";

export const useWheelStore = defineStore("wheel", () => {
  /**
   * 转盘上渲染的数据
   */
  const items = ref([]);
  /**
   * 原始数据
   */
  const rawItems = ref([]);
  /**
   * 隐藏的数据
   */
  const hiddenItems = ref([]);
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
    rawItems.value.splice(index, 1);
  }

  return {
    items,
    rawItems,
    hiddenItems,
    randomedItem,
    notRandomedItem,
    randomedHistory,

    isInitData,
    isRotating,
    isSupportSpeechSynthesis,
    isSpeaking,

    clearRandomedHistory,
    deleteItem
  };
});
