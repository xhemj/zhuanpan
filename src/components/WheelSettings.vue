<template>
  <h3 class="text-lg font-bold hidden">高级设置</h3>
  <!-- <p class="text-sm text-gray-400 text-center mb-2">当前页面施工中……</p> -->
  <div class="mb-2">
    <el-alert title="当前页面仅供调试使用" type="warning" show-icon />
  </div>
  <el-form label-width="auto">
    <el-form-item label="转盘旋转时长">
      <el-input-number
        v-model="configInstance.rotateTime"
        :disabled="wheel.isRotating"
        :min="1"
        :max="10"
        :step="0.5"
      />
      <span class="ml-2">秒</span>
    </el-form-item>

    <el-form-item label="朗读结果">
      <el-switch v-model="configInstance.isAutoRead" />
    </el-form-item>

    <el-form-item label="语音合成测试">
      <div class="flex w-full sm:w-[75%]">
        <el-input
          v-model="speakTestStr"
          :disabled="!wheel.isSupportSpeechSynthesis"
          class="max-w-full w-auto mr-1"
        />
        <el-button
          type="primary"
          :disabled="!wheel.isSupportSpeechSynthesis || wheel.isSpeaking"
          @click="handleSpeakTest"
        >
          播放
        </el-button>
      </div>
      <div v-show="!wheel.isSupportSpeechSynthesis" class="my-2">
        <el-alert
          show-icon
          title="您的浏览器似乎不支持语音合成功能，请更换浏览器后再试。"
          type="warning"
        />
      </div>
    </el-form-item>

    <el-form-item label="缓存版本信息">
      <div class="w-full">
        <p class="text-gray-400 text-sm">
          <span class="font-bold">构建版本：</span>
          <span class="text-gray-400"
            ><span class="border-b border-dashed">{{ commitSha }}</span> -
            {{ isDev ? "DEV" : "PROD" }}
          </span>
        </p>
        <p class="text-gray-400 text-sm">
          <span class="font-bold">构建时间：</span>
          <span class="text-gray-400">{{ buildDate }}</span>
        </p>
      </div>
    </el-form-item>

    <el-form-item label="清除缓存">
      <el-button type="danger" @click="handleClearCache">清除</el-button>
    </el-form-item>

    <el-form-item label="SW 状态">
      <div class="w-full">
        <p class="text-gray-400 text-sm" v-if="!isSupportServiceWorker">不支持</p>
        <p class="text-gray-400 text-sm" v-else-if="offlineReady">已准备好离线使用</p>
        <p class="text-gray-400 text-sm" v-else>检测到了内容更新</p>
      </div>
    </el-form-item>

    <el-form-item label="清除 SW">
      <el-button type="danger" @click="handleUnregisterSW">移除注册</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { clearLocalSettings, showMessageBox } from "../utils";
import { useWheelStore } from "@/stores/wheel";
import { useSettingStore } from "@/stores/setting";
import { useRegisterSW } from "virtual:pwa-register/vue";
const { offlineReady, updateServiceWorker } = useRegisterSW();

const emit = defineEmits(["speakResult"]);

const isSupportServiceWorker = ref(false);
// @ts-ignore
const commitSha = __COMMIT_HASH__;
// @ts-ignore
const now = __BUILD_DATE__;
const buildDate = new Date(now).toLocaleString();
const isDev = import.meta.env.DEV;

const wheel = useWheelStore();
const settings = useSettingStore();

const speakTestStr = ref("测试语音合成");

const configInstance = {
  /**
   * 旋转时长
   */
  get rotateTime() {
    return settings.wheelRotateTime;
  },
  set rotateTime(val) {
    settings.setWheelRotateTime(val);
  },
  /**
   * 是否自动朗读结果
   */
  get isAutoRead() {
    return settings.isAutoRead;
  },
  set isAutoRead(val) {
    settings.setIsAutoRead(val);
  }
};

/**
 * 模拟语音合成
 */
function handleSpeakTest() {
  emit("speakResult", speakTestStr.value);
}

/**
 * 卸载 ServiceWorker
 */
async function handleUnregisterSW() {
  // 移除所有 serviceworker
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      registration.unregister();
    }
  }
  // 移除所有本地缓存
  if (window.caches) {
    const keys = await caches.keys();
    for (let key of keys) {
      await caches.delete(key);
    }
  }
  updateServiceWorker();
}

/**
 * 清除缓存
 */
function handleClearCache() {
  showMessageBox({
    title: "提示",
    message: "确定要清除缓存吗？",
    type: "warning",
    confirmButtonText: "清除",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger",
    callback: async () => {
      clearLocalSettings("wheel");
      await handleUnregisterSW();
      window.location.reload();
    }
  });
}

onMounted(() => {
  settings.init();
  isSupportServiceWorker.value = "serviceWorker" in navigator;
});
</script>

<style scoped></style>
