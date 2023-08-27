<template>
  <h3 class="text-lg font-bold hidden">历史结果</h3>
  <el-table
    :scrollbar-always-on="true"
    :show-header="false"
    stripe
    :data="tableRamdomedData"
    style="width: 100%"
    max-height="250"
  >
    <template #empty>
      <p class="text-center text-gray-400">暂无数据</p>
    </template>
    <el-table-column type="index" />
    <el-table-column prop="name" />
  </el-table>
  <!-- 清空列表按钮 -->
  <el-button
    class="mt-2 w-full"
    type="danger"
    :disabled="!wheel.randomedHistory.length || wheel.isRotating"
    @click="handleClearHistory"
  >
    清空列表
  </el-button>
</template>

<script setup>
import { computed } from "vue";
import { useWheelStore } from "@/stores/wheel";

const wheel = useWheelStore();

const tableRamdomedData = computed(() => {
  return wheel.randomedHistory.map((item, index) => {
    return {
      name: wheel.items[item]
    };
  });
});

/**
 * 清除历史记录
 */
function handleClearHistory() {
  showMessageBox({
    title: "提示",
    message: "确定要清除历史结果吗？",
    type: "warning",
    confirmButtonText: "清除",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger",
    callback: () => {
      wheel.clearRandomedHistory();
    }
  });
}
</script>

<style scoped></style>
