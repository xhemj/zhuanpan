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

/**
 * 判断是否为手机端
 */
export function useDevice() {
  const ua = navigator.userAgent;
  const isAndroid = ua.indexOf("Android") > -1 || ua.indexOf("Adr") > -1; //android终端
  const isiOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
  return {
    isMobile: isAndroid || isiOS
  };
}
