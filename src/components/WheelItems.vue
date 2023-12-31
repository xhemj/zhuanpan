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
    <el-table-column type="index" label="#" />
    <el-table-column prop="name" label="名称">
      <template #default="scope">
        <div
          id="edit-area item-visible"
          v-if="wheel.hiddenItems.includes(scope.row.name)"
          class="text-gray-400"
        >
          <span class="line-through">{{ scope.row.name }}</span>
          <el-button
            class="pl-1"
            text
            type="info"
            size="small"
            :disabled="wheel.isRotating"
            @click="handleTableEdit(scope.$index, scope.row)"
            :icon="Hide"
          >
            已隐藏
          </el-button>
        </div>
        <div v-else id="edit-area item-visible" class="w-full group/item">
          <span>{{ scope.row.name }}</span>
          <!-- <span class="invisible group-hover/item:visible">
            <el-button
              class="pl-1"
              text
              type="info"
              size="small"
              :disabled="wheel.isRotating"
              @click="handleTableEdit(scope.$index, scope.row)"
              :icon="View"
            >
              隐藏此项
            </el-button>
          </span> -->
        </div>
      </template>
    </el-table-column>
    <el-table-column align="right" label="操作">
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
    <div class="w-full">
      <el-button
        class="w-full"
        :disabled="wheel.isRotating"
        @click="
          () => {
            isAddingTableItem = false;
            waitAddTableItem = '';
          }
        "
        text
        type="info"
      >
        取消
      </el-button>
    </div>
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
  <p class="text-sm text-gray-400">
    <el-icon class="align-middle mr-1"><Warning /></el-icon
    >所有的更改默认都不会保存到本地，如需永久保存，请在每次确认修改后点击页面下方的
    “保存当前列表”按钮。如需重置转盘到初始状态，请到 “高级设置” 处清除缓存。
  </p>
  <p class="text-right text-sm text-gray-400 mt-0">共 {{ wheel.items.length }} 项</p>
  <!-- 表格编辑弹出框 -->
  <el-dialog title="编辑" v-model="editDialogVisible" :close-on-click-modal="false">
    <el-form :model="editDialogForm" label-width="auto" @submit.prevent>
      <el-form-item label="显示名称" required>
        <el-input v-model="editDialogForm.name" />
        <p class="text-sm text-gray-400">
          <el-icon class="align-middle mr-1"><Warning /></el-icon
          >如需保存修改到本地，请在确认修改后点击页面下方的 “保存当前列表” 按钮。
        </p>
      </el-form-item>
      <el-form-item label="转盘中隐藏">
        <el-switch v-model="editDialogForm.isHidden" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmEdit">确认修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref, nextTick, onMounted } from "vue";
import { useWheelStore } from "@/stores/wheel";
import { setLocalSettings, showMessageBox } from "../utils";
import { Delete, Edit, Hide, Warning } from "@element-plus/icons-vue";

const emit = defineEmits(["update"]);

const wheel = useWheelStore();
const tableRef = ref(null);
const isInitTable = ref(false);

const tableData = computed(() => {
  return wheel.rawItems.map((item, index) => {
    return {
      name: item
    };
  });
});

/**
 * 初始化表格
 */
function initTable() {
  // 默认选择全部项
  // tableRef.value.toggleAllSelection();
  nextTick(() => {
    isInitTable.value = true;
  });
}

const editDialogForm = ref({
  name: "",
  index: -1,
  isHidden: false
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
  editDialogForm.value.isHidden = wheel.hiddenItems.includes(row.name);
  editDialogVisible.value = true;
}

/**
 * 确认编辑
 */
function confirmEdit() {
  editDialogVisible.value = false;
  wheel.items[editDialogForm.value.index] = editDialogForm.value.name;
  wheel.rawItems[editDialogForm.value.index] = editDialogForm.value.name;
  // 更新隐藏项
  if (editDialogForm.value.isHidden) {
    wheel.hiddenItems.push(editDialogForm.value.name);
  } else {
    const index = wheel.hiddenItems.indexOf(editDialogForm.value.name);
    if (index > -1) {
      wheel.hiddenItems.splice(index, 1);
    }
  }
  // 移除 wheel.items 中的隐藏的项
  wheel.items = wheel.rawItems.filter((item) => !wheel.hiddenItems.includes(item));
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
    message: `确定要移除名字 "${row.name}" 吗？`,
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
  wheel.rawItems = JSON.parse(JSON.stringify(wheel.items));
  isAddingTableItem.value = false;
  ElMessage({
    message: `成功添加 ${items.length} 项`,
    type: "success"
  });
  // handleSaveToLocal();
  nextTick(() => {
    if (items.length && tableRef.value) {
      tableRef.value.scrollTo(0, 9999);
    }
  });
  emit("update");
}

/**
 * 右键菜单
 * @param {number} row 行
 * @param {number} column 列
 * @param {object} cell 单元格
 * @param {object} event 事件
 */
function handleCellContextMenu(row, column, cell, event) {
  event.preventDefault();
  handleTableEdit(row.$index, row);
}

/**
 * 保存到本地
 */
function handleSaveToLocal() {
  setLocalSettings("wheel", "items", JSON.stringify(wheel.items));
  ElMessage({
    message: "保存成功",
    type: "success"
  });
}

onMounted(() => {
  initTable();
});
</script>

<style scoped>
@media (max-width: 640px) {
  #edit-area :deep(.el-button span) {
    display: none;
  }
}

#item-visible .el-button {
  @apply !p-0 !ml-1;
}

.text-link {
  color: #409eff;
  color: var(--el-color-primary);
  @apply cursor-pointer;
}
</style>
