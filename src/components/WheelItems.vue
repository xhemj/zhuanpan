<template>
  <h3 class="text-lg font-bold hidden">抽取名单</h3>
  <el-table
    v-loading="!wheel.isInitData"
    ref="tableRef"
    :scrollbar-always-on="true"
    :show-header="false"
    stripe
    :data="tableData"
    class="w-full"
    max-height="250"
  >
    <template #empty>
      <p class="text-center text-gray-400">暂无数据</p>
    </template>
    <el-table-column type="index" />
    <el-table-column prop="name" />
    <el-table-column align="right">
      <template #default="scope">
        <div id="edit-area">
          <el-button
            type="primary"
            size="small"
            :disabled="wheel.isRotating"
            @click="handleTableEdit(scope.$index, scope.row)"
            :icon="Edit"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            :disabled="wheel.isRotating"
            @click="handleTableDelete(scope.$index, scope.row)"
            :icon="Delete"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <!-- 添加项目区 -->
  <div v-if="isAddingTableItem" class="mt-2">
    <el-input
      v-model="waitAddTableItem"
      :autosize="{ minRows: 2, maxRows: 5 }"
      type="textarea"
      placeholder="请输入带抽取的项目，每行一个"
      :disabled="wheel.isRotating"
    />
    <el-button
      class="mt-2 w-full"
      type="primary"
      :disabled="wheel.isRotating"
      @click="confirmAddItem"
    >
      确认添加
    </el-button>
  </div>
  <!-- 添加更多按钮 -->
  <el-button
    v-if="!isAddingTableItem"
    class="mt-2 w-full"
    :disabled="wheel.isRotating"
    @click="onAddItem"
    type="primary"
  >
    添加更多
  </el-button>
  <span class="w-full">
    <el-button
      v-if="!isAddingTableItem"
      class="w-full"
      :disabled="wheel.isRotating"
      @click="handleSaveToLocal"
      text
      type="primary"
    >
      保存当前列表
    </el-button>
  </span>
  <p class="text-right text-sm text-gray-400 mt-2">共 {{ wheel.items.length }} 项</p>

  <!-- 表格编辑弹出框 -->
  <el-dialog title="编辑" v-model="editDialogVisible" :close-on-click-modal="false">
    <el-form :model="editDialogForm">
      <el-form-item label="名称">
        <el-input v-model="editDialogForm.name" />
        <p class="text-sm text-gray-400">
          如需保存修改到本地，请在确认修改后点击页面下方的 “保存当前列表” 按钮。
        </p>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmEdit"> 确认修改 </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, nextTick, onMounted } from "vue";
import { useWheelStore } from "@/stores/wheel";
import { showMessageBox } from "../utils";
import { Delete, Edit } from "@element-plus/icons-vue";

const emit = defineEmits(["update"]);

const wheel = useWheelStore();
const tableRef = ref(null);
const isMobile = ref(false);

const tableData = computed(() => {
  return wheel.items.map((item, index) => {
    return {
      name: item
    };
  });
});

const editDialogForm = ref({
  name: "",
  index: -1
});
const editDialogVisible = ref(false);

/**
 * 编辑表格项
 * @param {number} index 索引
 * @param {object} row 行数据
 */
function handleTableEdit(index, row) {
  editDialogForm.value.name = row.name;
  editDialogForm.value.index = index;
  editDialogVisible.value = true;
}

/**
 * 确认编辑
 */
function confirmEdit() {
  editDialogVisible.value = false;
  wheel.items[editDialogForm.value.index] = editDialogForm.value.name;
  emit("update");
}

/**
 * 移除表格项
 * @param {number} index 索引
 * @param {object} row 行数据
 */
function handleTableDelete(index, row) {
  showMessageBox({
    title: "提示",
    message: `确定要永久移除名字 "${row.name}" 吗？此操作不可撤回！`,
    type: "warning",
    confirmButtonText: "移除",
    cancelButtonText: "取消",
    confirmButtonClass: "el-button--danger",
    callback: () => {
      wheel.deleteItem(index);
      emit("update");
      ElMessage({
        message: "移除成功",
        type: "success"
      });
    }
  });
}

const isAddingTableItem = ref(false);
const waitAddTableItem = ref("");

/**
 * 点击添加更多按钮
 */
function onAddItem() {
  isAddingTableItem.value = true;
  waitAddTableItem.value = "";
}

/**
 * 确认添加
 */
function confirmAddItem() {
  const items = waitAddTableItem.value.split("\n").filter((item) => item);
  // 是否已经有了
  const hasItem = wheel.items.some((item) => items.includes(item));
  // 移除重复项
  if (hasItem) {
    items.forEach((item) => {
      const index = wheel.items.indexOf(item);
      if (index > -1) {
        wheel.items.splice(index, 1);
        wheel.itemsAngle.splice(index, 1);
      }
    });
  }
  wheel.items = wheel.items.concat(items);
  isAddingTableItem.value = false;
  ElMessage({
    message: `成功添加 ${items.length} 项`,
    type: "success"
  });
  handleSaveToLocal();
  nextTick(() => {
    if (items.length && tableRef.value) {
      tableRef.value.scrollTo(0, 9999);
    }
  });
  emit("update");
}

/**
 * 保存到本地
 */
function handleSaveToLocal() {
  localStorage.setItem(wheel.localstorageKey, JSON.stringify(wheel.items));
  ElMessage({
    message: "保存成功",
    type: "success"
  });
}

//
</script>

<style scoped>
@media (max-width: 640px) {
  #edit-area :deep(.el-button span) {
    display: none;
  }
}
</style>
