import { ElMessage, ElMessageBox } from "element-plus";

/**
 * 显示消息提示框
 * @param {Object} config 配置项
 */
export function showMessageBox(
  config = {
    title: "",
    message: "",
    type: "info",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--primary",
    callback: () => {}
  }
) {
  return ElMessageBox.confirm(config.message, config.title, {
    confirmButtonText: config.confirmButtonText,
    cancelButtonText: config.cancelButtonText,
    type: config.type,
    confirmButtonClass: config.confirmButtonClass,
    closeOnClickModal: false
  })
    .then(() => {
      typeof config.callback === "function" && config.callback();
    })
    .catch(() => {
      // do nothing
    });
}

const storageKey = "config";

/**
 * 写入本地设置
 * @param {string} tag 分类
 * @param {string} key 键
 * @param {any} value 值
 */
export const setLocalSettings = (tag, key, value) => {
  const localSettings = localStorage.getItem(storageKey) || "{}";
  const settings = JSON.parse(localSettings);
  if (!settings[tag]) {
    settings[tag] = {};
  }
  settings[tag][key] = value;
  localStorage.setItem(storageKey, JSON.stringify(settings));
};

/**
 * 读取本地设置
 * @param {string} tag 分类
 */
export const getLocalSettings = (tag) => {
  const localSettings = localStorage.getItem(storageKey) || "{}";
  const settings = JSON.parse(localSettings);
  return settings[tag] || {};
};

/**
 * 清除本地设置
 * @param {string} tag 分类
 */
export const clearLocalSettings = (tag) => {
  const localSettings = localStorage.getItem(storageKey) || "{}";
  const settings = JSON.parse(localSettings);
  if (tag) {
    delete settings[tag];
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } else {
    localStorage.removeItem(storageKey);
  }
};
