<template>
  <div v-loading.fullscreen.lock="!isInitData" element-loading-text="加载数据中……"></div>
  <h2 v-show="isInitData" class="font-bold text-2xl md:text-4xl text-center mb-2 md:mb-4">
    {{ wheelResult ? wheelResult : isRotating ? "……" : "点击转盘开始抽奖" }}
  </h2>
  <div v-show="isInitData" ref="canvasContainer" id="canvasContainer" class="relative">
    <canvas
      ref="canvasDom"
      id="wheel"
      :width="canvasWidth"
      :height="canvasWidth"
      :style="{
        transform: `rotate(${canvasRotate}deg)`
      }"
      :class="{
        'animate-rotating': isRotating
      }"
    >
      您的浏览器不支持canvas，请更换浏览器后再试。
    </canvas>
    <div
      class="flex absolute left-0 right-0 top-0 bottom-0 justify-center items-center h-full w-full select-none"
    >
      <img
        :src="WheelButtonImage"
        alt="转动转盘"
        class="h-auto w-32"
        :style="{
          width: canvasWidth * 0.35 + 'px'
        }"
        :class="{
          'cursor-pointer': !isRotating
        }"
        @click="handleRotate"
      />
    </div>
  </div>

  <div v-show="isInitData" class="mt-6">
    <el-table
      v-loading="!isInitData"
      ref="tableRef"
      :scrollbar-always-on="true"
      stripe
      :data="tableData"
      style="width: 100%"
      max-height="250"
    >
      <el-table-column prop="name" label="待抽奖名称" />
      <el-table-column align="right">
        <template #default="scope">
          <el-button
            size="small"
            type="danger"
            :disabled="isRotating"
            @click="handleTableDelete(scope.$index, scope.row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <p class="text-right text-sm text-gray-400">共 {{ config.item.length }} 项</p>
    <div v-if="isAddingTableItem" class="mt-2">
      <el-input
        v-model="waitAddTableItem"
        :autosize="{ minRows: 2, maxRows: 5 }"
        type="textarea"
        placeholder="请输入带抽取的项目，每行一个"
        :disabled="isRotating"
      />
      <el-button class="mt-2" type="primary" style="width: 100%" @click="confirmAddItem">
        确认添加
      </el-button>
    </div>
    <el-button
      v-if="!isAddingTableItem"
      class="mt-2"
      style="width: 100%"
      :disabled="isRotating"
      @click="onAddItem"
    >
      添加更多
    </el-button>
  </div>
  <div v-show="isInitData" class="mt-8">
    <p class="text-center text-sm text-gray-400">
      班级电脑小转盘 © {{ new Date().getFullYear() }} XHEMJ
    </p>
    <p class="text-center text-sm text-gray-400">配色与素材来源于手机软件“小决定”</p>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useDark } from "@vueuse/core";
import WheelButtonImage from "../assets/images/wheel_spin_button.png"; // 转盘按钮图片

const canvasContainer = ref(null);
const canvasDom = ref(null);
const tableRef = ref(null);

const canvasWidth = ref(0);
const canvasHeight = ref(0);
const config = ref({
  outsideRadius: 192, // 大转盘外圆的半径
  textRadius: 155, // 大转盘奖品位置距离圆心的距离
  insideRadius: 68, // 大转盘内圆的半径
  startAngle: 0, // 开始角度
  colors: [
    "rgb(124,54,212)",
    "rgb(185,48,196)",
    "rgb(213,55,106)",
    "rgb(214,51,56)",
    "rgb(235,110,62)",
    "rgb(130,175,72)",
    "rgb(63,144,187)",
    "rgb(30,89,205)"
  ],
  item: [], // 奖品名称
  itemAngle: [] // 每个奖品所占的角度
});
const canvasRotate = ref(0); // 转盘旋转角度
const eachAngle = computed(() => 360 / config.value.item.length); // 每个奖品所占的角度
const wheelResult = ref(""); // 转盘结果
const isRotating = ref(false); // 是否正在旋转

const tableData = computed(() => {
  return config.value.item.map((item, index) => {
    return {
      name: item
    };
  });
});

const handleTableDelete = (index, row) => {
  config.value.item.splice(index, 1);
  config.value.itemAngle.splice(index, 1);
  initCanvas();
};

const isAddingTableItem = ref(false);
const waitAddTableItem = ref("");

const onAddItem = () => {
  isAddingTableItem.value = true;
  waitAddTableItem.value = "";
};

const confirmAddItem = () => {
  const items = waitAddTableItem.value.split("\n").filter((item) => item);
  // 是否已经有了
  const hasItem = config.value.item.some((item) => items.includes(item));
  // 移除重复项
  if (hasItem) {
    items.forEach((item) => {
      const index = config.value.item.indexOf(item);
      if (index > -1) {
        config.value.item.splice(index, 1);
        config.value.itemAngle.splice(index, 1);
      }
    });
  }
  config.value.item = config.value.item.concat(items);
  isAddingTableItem.value = false;
  nextTick(() => {
    if (items.length && tableRef.value) {
      tableRef.value.scrollTo(0, 9999);
    }
  });
  initCanvas();
};

const isInitData = ref(false);

async function initItemData() {
  const data = await fetch(
    "https://staticoss.xhemj.work/zhuanpan.xhemj.com/data.json?_t=" + Date.now(),
    {
      mode: "cors"
    }
  );
  const json = await data.json();
  config.value.item = json;
  isInitData.value = true;
  resizeCanvas();
}

function resizeCanvas() {
  const windowHeight = window.innerHeight - 150;
  const width = Math.min(windowHeight, 600);
  document.querySelector("#app").style.maxWidth = width + "px";
  if (!canvasDom.value || !canvasContainer.value) return;
  nextTick(() => {
    const { width } = canvasContainer.value.getBoundingClientRect();
    // 1:1
    canvasWidth.value = width;
    canvasHeight.value = width;

    initCanvas();
    window.addEventListener("resize", resizeCanvas);
  });
}

function initCanvas() {
  const canvas = canvasDom.value;
  if (canvas.getContext) {
    config.value.outsideRadius = canvasWidth.value / 2 - 10;
    config.value.textRadius = canvasWidth.value / 2 - 40;
    nextTick(() => {
      drawWheel(canvas);
    });
  }
}

function drawWheel(canvas) {
  const ctx = canvas.getContext("2d");
  const arc = Math.PI / (config.value.item.length / 2); // 根据奖品个数计算圆周角度
  ctx.clearRect(0, 0, canvasWidth.value, canvasWidth.value);
  // 获取根元素字体大小
  const fontSize = parseFloat(
    getComputedStyle(document.querySelector("#screen-fontsize")).fontSize
  );
  // ctx.font = "20px bold Microsoft YaHei";
  ctx.font = `${fontSize * 1}px bold Microsoft YaHei`;

  const halfWidth = canvasWidth.value / 2;

  for (let i = 0; i < config.value.item.length; i++) {
    let angle = config.value.startAngle + i * arc;
    ctx.fillStyle = config.value.colors[i % config.value.colors.length] || config.value.colors[0];
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    // 绘制外圆
    ctx.moveTo(halfWidth, halfWidth);
    // arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）
    ctx.arc(halfWidth, halfWidth, config.value.outsideRadius, angle, angle + arc, false);
    ctx.lineTo(halfWidth, halfWidth);

    // 外园 ctx.arc(halfWidth, halfWidth, config.value.outsideRadius, angle, angle + arc, false);
    // 内圆 ctx.arc(halfWidth, halfWidth, config.value.insideRadius, angle + arc, angle, true);

    ctx.stroke();
    ctx.fill();
    // 锁画布(为了保存之前的画布状态)
    ctx.save();

    //----绘制奖品开始----
    ctx.fillStyle = "#fff";
    let text = config.value.item[i];
    // translate方法重新映射画布上的 (0,0) 位置
    ctx.translate(
      halfWidth + Math.cos(angle + arc / 2) * config.value.textRadius,
      halfWidth + Math.sin(angle + arc / 2) * config.value.textRadius
    );

    // rotate方法旋转当前的绘图
    ctx.rotate(angle + arc / 2 + Math.PI / 2);
    // 文本横向排列
    ctx.rotate((-90 * Math.PI) / 180);
    // 设置阴影
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowColor = "#000";
    ctx.shadowBlur = 10;
    //在画布上绘制填色的文本。文本的默认颜色是黑色
    //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
    ctx.fillText(text, -ctx.measureText(text).width + 20, 0);
    ctx.rotate((90 * Math.PI) / 180);
    //把当前画布返回（调整）到上一个save()状态之前
    ctx.restore();
    //----绘制奖品结束----
  }
}

/**
 * 格式化角度（大于360度的角还原成小角）
 * @param {number} angle 角度
 */
function normalizeAngle(angle) {
  return angle - Math.floor(angle / 360) * 360;
}

/**
 * 转动转盘
 * @param {number} position 转动目标位置
 * @param {string} text 提示文字
 */
function rotateWheel(position, text) {
  let angles = position * (360 / config.value.item.length) - 360 / (config.value.item.length * 2);
  if (angles < 270) {
    angles = 270 - angles;
  } else {
    angles = 360 - angles + 270;
  }
  // 随机偏移量
  const offset = randomNumber(-eachAngle.value / 2 + 10, eachAngle.value / 2 - 10);
  canvasRotate.value = angles + 1800 + offset;
  setInterval(() => {
    const currentAngle = getRotationDegrees();
    for (let angle of config.value.itemAngle) {
      if (currentAngle >= angle.start && currentAngle <= angle.end) {
        wheelResult.value = config.value.item[config.value.itemAngle.indexOf(angle)];
        break;
      }
    }
  }, 10);
  //   const timer = playTickSound();
  setTimeout(() => {
    isRotating.value = false;
    canvasRotate.value = normalizeAngle(canvasRotate.value);
    // alert(text);
    wheelResult.value = text;
    speakResult();
    // timer && clearTimeout(timer);
  }, 5 * 1000);
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function handleRotate() {
  if (isRotating.value) return;
  isRotating.value = true;
  wheelResult.value = "";
  const position = randomNumber(1, config.value.item.length);
  rotateWheel(position, config.value.item[position - 1]);
}

/**
 * 实时获取转盘旋转角度
 */
function getRotationDegrees() {
  if (!canvasDom.value) return 0;
  var matrix = getComputedStyle(canvasDom.value).getPropertyValue("transform");
  if (matrix !== "none") {
    var values = matrix.split("(")[1].split(")")[0].split(",");
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
    return angle < 0 ? angle + 360 : angle;
  }
  return 0;
}

function speakResult() {
  const text = wheelResult.value;
  if (!text) return;
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "zh-CN";
  msg.rate = 0.7;
  msg.pitch = 1;
  msg.volume = 1;
  window.speechSynthesis.speak(msg);
}

onMounted(() => {
  initItemData();
  const isDark = useDark();
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  }
});
</script>

<style scoped>
.animate-rotating {
  transition-duration: 5s;
  transition-timing-function: cubic-bezier(0.6, 0, 0, 1);
}
</style>
