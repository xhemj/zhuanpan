<template>
  <h3 class="text-lg font-bold hidden">高级设置</h3>
  <!-- <p class="text-sm text-gray-400 text-center mb-2">当前页面施工中……</p> -->
  <div class="mb-2">
    <el-alert title="当前页面施工中……" type="info" show-icon />
  </div>
  <el-form label-width="auto">
    <el-form-item label="旋转时长">
      <el-input-number
        v-model="wheel.rotateTime"
        :disabled="wheel.isRotating"
        :min="1"
        :max="10"
        :step="0.5"
      />
      <span class="ml-2">秒</span>
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

    <el-form-item label="清除缓存">
      <el-button type="danger" @click="handleClearCache">清除</el-button>
    </el-form-item>
  </el-form>
  <p class="text-sm text-gray-400 text-left mt-2">
    开发者：目前还没做保存设置到本地的功能，所以每次刷新网页都要重新来调一遍设置咯~~
  </p>
  <p class="text-sm text-gray-400 text-left">其实这个页面主要是供我自己调试用的吧……</p>
</template>

<script setup>
import { useWheelStore } from "@/stores/wheel";
import { ref } from "vue";
import { showMessageBox } from "../utils";

const emit = defineEmits(["speakResult"]);

const wheel = useWheelStore();

const speakTestStr = ref("测试语音合成");

/**
 * 模拟语音合成
 */
function handleSpeakTest() {
  emit("speakResult", speakTestStr.value);
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
    callback: () => {
      localStorage.removeItem(wheel.localstorageKey);
      window.location.reload();
    }
  });
}
</script>

<style scoped></style>
