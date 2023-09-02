<template>
  <!-- 加载中遮罩 -->
  <div v-loading.fullscreen.lock="!wheel.isInitData" element-loading-text="加载数据中……"></div>

  <!-- 转盘结果区 -->
  <h2 v-show="wheel.isInitData" class="font-bold text-2xl md:text-4xl text-center mb-2 md:mb-4">
    {{ wheelResult ? wheelResult : wheel.isRotating ? "……" : "点击转盘开始抽奖" }}
  </h2>

  <!-- 转盘区 -->
  <div v-show="wheel.isInitData" ref="canvasContainer" id="canvasContainer" class="relative">
    <canvas
      ref="canvasDom"
      id="wheel"
      :width="canvasWidth"
      :height="canvasWidth"
      :style="{
        transform: `rotate(${canvasRotate}deg)`,
        transitionDuration: wheel.isRotating ? `${settings.wheelRotateTime}s` : null
      }"
      :class="{
        'animate-rotating': wheel.isRotating
      }"
    >
      您的浏览器不支持canvas，请更换浏览器后再试。
    </canvas>
    <div
      class="flex absolute left-0 right-0 top-0 bottom-0 justify-center items-center h-full w-full select-none"
    >
      <img
        src="/images/wheel_spin_button.png"
        alt="转动转盘"
        class="h-auto w-32"
        :style="{
          width: canvasWidth * 0.35 + 'px'
        }"
        :class="{
          'cursor-pointer': !wheel.isRotating,
          'cursor-not-allowed': wheel.isRotating
        }"
        @click="handleRotate"
      />
    </div>
  </div>

  <!-- 配置区域 -->
  <div v-show="wheel.isInitData" class="mt-6">
    <el-tabs v-model="activeTabName" type="border-card">
      <el-tab-pane label="抽取列表" name="1">
        <WheelItems @update="initCanvas" />
      </el-tab-pane>
      <el-tab-pane label="历史结果" name="2">
        <WheelHistory />
      </el-tab-pane>
      <el-tab-pane label="高级设置" name="3">
        <WheelSettings @speakResult="speakResult" />
      </el-tab-pane>
    </el-tabs>
  </div>

  <!-- 版权提示 -->
  <div v-show="wheel.isInitData" class="mt-8">
    <p class="text-center text-sm text-gray-400">
      班级电脑小转盘 © {{ new Date().getFullYear() }} XHEMJ
    </p>
    <p class="text-center text-sm text-gray-400">配色与素材来源于手机软件“小决定”</p>
    <p class="text-center text-sm">
      <a
        class="text-gray-400"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        闽ICP备2022010207号
      </a>
    </p>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, ref } from "vue";
import { useDark } from "@vueuse/core";
import { useWheelStore } from "@/stores/wheel";
import { useSettingStore } from "@/stores/setting";
import { getLocalSettings, setLocalSettings } from "../utils";

const WheelHistory = defineAsyncComponent(() => import("../components/WheelHistory.vue"));
const WheelItems = defineAsyncComponent(() => import("../components/WheelItems.vue"));
const WheelSettings = defineAsyncComponent(() => import("../components/WheelSettings.vue"));

const wheel = useWheelStore();
const settings = useSettingStore();
const canvasContainer = ref(null);
const canvasDom = ref(null);

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
  randomedItem: [] // 已抽名单
});
const canvasRotate = ref(0); // 转盘旋转角度
const eachAngle = computed(() => 360 / wheel.items.length); // 每个奖品所占的角度
const wheelResult = ref(""); // 转盘结果
const activeTabName = ref("1");

/**
 * 初始化数据
 */
async function initItemData() {
  // 2023.08.30 本地缓存格式更换兼容性处理
  const oldData = localStorage.getItem("wheel_data");
  if (oldData) {
    setLocalSettings("wheel", "items", oldData);
    localStorage.removeItem("wheel_data");
  }
  const localConfig = getLocalSettings("wheel", "items");
  console.log("====本地缓存", localConfig);
  const localData = localConfig.items ? JSON.parse(localConfig.items) : [];
  let data = null;
  if (localData && localData.length) {
    data = localData;
  } else {
    const res = await fetch(
      "https://staticoss.xhemj.work/zhuanpan.xhemj.com/data.json?_t=" + Date.now(),
      {
        mode: "cors"
      }
    );
    const json = await res.json();
    data = json;
  }
  wheel.items = data;
  wheel.rawItems = data;
  wheel.isInitData = true;
  resizeCanvas();
}

/**
 * 计算画布大小
 */
function resizeCanvas() {
  const windowHeight = window.innerHeight - 150;
  const width = Math.min(windowHeight, 700);
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

let canvas;

/**
 * 初始化画布
 */
function initCanvas() {
  // console.log("====初始化画布");
  canvas = canvasDom.value;
  if (canvas.getContext) {
    config.value.outsideRadius = canvasWidth.value / 2 - 10;
    config.value.textRadius = canvasWidth.value / 2 - 40;
    nextTick(() => {
      drawWheel(canvas);
    });
  }
}

/**
 * 绘制转盘
 * @param {HTMLCanvasElement} canvas 画布
 */
function drawWheel(canvas) {
  const ctx = canvas.getContext("2d");

  // 解决 canvas 手机上模糊问题
  const devicePixelRatio = window.devicePixelRatio || 1;
  const backingStoreRatio =
    ctx.webkitBackingStorePixelRatio ||
    ctx.mozBackingStorePixelRatio ||
    ctx.msBackingStorePixelRatio ||
    ctx.oBackingStorePixelRatio ||
    ctx.backingStorePixelRatio ||
    1;
  const ratio = devicePixelRatio / backingStoreRatio;
  canvas.width = canvasWidth.value * ratio;
  canvas.height = canvasHeight.value * ratio;
  canvas.style.width = canvasWidth.value + "px";
  canvas.style.height = canvasHeight.value + "px";
  ctx.scale(ratio, ratio);

  // 根据奖品个数计算圆周角度
  const arc = Math.PI / (wheel.items.length / 2);
  ctx.clearRect(0, 0, canvasWidth.value, canvasWidth.value);
  // 获取根元素字体大小
  const fontSize = parseFloat(
    getComputedStyle(document.querySelector("#screen-fontsize")).fontSize
  );
  // ctx.font = "20px bold Microsoft YaHei";
  ctx.font = `${fontSize * 1}px bold Microsoft YaHei`;

  const halfWidth = canvasWidth.value / 2;

  for (let i = 0; i < wheel.items.length; i++) {
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

    // ----绘制奖品开始----
    ctx.fillStyle = "#fff";
    let text = wheel.items[i];
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
    // 在画布上绘制填色的文本。文本的默认颜色是黑色
    // measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
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
  let angles = position * (360 / wheel.items.length) - 360 / (wheel.items.length * 2);
  if (angles < 270) {
    angles = 270 - angles;
  } else {
    angles = 360 - angles + 270;
  }
  // 随机偏移量
  const offset = randomNumber(-eachAngle.value / 2 + 10, eachAngle.value / 2 - 10);
  canvasRotate.value = angles + 1800 + offset;
  setTimeout(() => {
    wheel.isRotating = false;
    canvasRotate.value = normalizeAngle(canvasRotate.value);
    // alert(text);
    wheelResult.value = text;
    if (settings.isAutoRead) {
      speakResult(text);
    }
    // timer && clearTimeout(timer);
    wheel.randomedHistory.push(position - 1);
  }, settings.wheelRotateTime * 1000);
}

/**
 * 生成随机数
 * @param {number} min 最小值
 * @param {number} max 最大值
 */
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 数组乱序
 * @param {Array} array 数组
 */
function shuffle(array) {
  const tempArray = array.map((value) => ({ value, i: Math.random() }));
  tempArray.sort((a, b) => a.i - b.i);
  array.forEach((_, i) => {
    array[i] = tempArray[i].value;
  });
}

let maxNum = ref(-1); // 最大随机数

/**
 * 点击转盘按钮
 */
function handleRotate() {
  if (wheel.isRotating) return;
  wheel.isRotating = true;

  if (wheel.items.length !== maxNum.value || !wheel.notRandomedItem.length) {
    console.log("====初始化随机数");
    const max = wheel.items.length;
    maxNum.value = max;
    wheel.randomedItem = [];
    wheel.notRandomedItem = [];
    for (let i = 0; i < max; i++) {
      wheel.notRandomedItem.push(i);
    }
    shuffle(wheel.notRandomedItem);
  }
  const random = randomNumber(0, wheel.notRandomedItem.length - 1);
  const position = wheel.notRandomedItem[random];
  wheel.notRandomedItem.splice(random, 1);
  wheel.randomedItem.push(position);
  console.log("====随机数", position, wheel.items[position]);
  console.log("未抽取项", wheel.notRandomedItem);
  console.log("已抽取项", wheel.randomedItem);
  wheelResult.value = "";
  rotateWheel(position + 1, wheel.items[position]);
}

/**
 * 语音播报
 * @param {string} text 文字
 */
function speakResult(text) {
  if (!text || wheel.isSpeaking) return;
  if (!window.speechSynthesis) return;
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "zh-CN";
  msg.rate = 0.7;
  msg.pitch = 1;
  msg.volume = 1;
  msg.onstart = () => {
    wheel.isSpeaking = true;
  };
  msg.onend = () => {
    wheel.isSpeaking = false;
  };
  return window.speechSynthesis.speak(msg);
}

onMounted(() => {
  settings.init();
  initItemData();
  const isDark = useDark();
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  }
  window.speakResult = speakResult;
  wheel.isSupportSpeechSynthesis = !!window.speechSynthesis;
  window.initCanvas = initCanvas;
});
</script>

<style scoped>
.animate-rotating {
  transition-timing-function: cubic-bezier(0.25, 0.01, 0, 1);
}

:deep(.el-tabs--border-card > .el-tabs__content) {
  padding: 0.5rem;
}
</style>
