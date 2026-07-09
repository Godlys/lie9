# LIE9 v3 视觉升级需求文档

> 交给高级 AI 出设计方案，方案确认后由 Claude Code (CC) 执行实现。

## 一、项目概况

**LIE9** 是一个 SpaceX Falcon 9 / Merlin 1D 发动机交互式爆炸拆解展示网站。

线上地址：https://lie9.vercel.app

### 技术栈
- React 19 + TypeScript + Vite 6 + Bun
- Three.js 0.170 + @react-three/fiber v9 + @react-three/drei v10
- GSAP 3.15（场景切换动画）
- TailwindCSS 4（UI 样式）
- 字体：Geist Sans + Geist Mono（自托管 @fontsource）

### 部署
- Vercel 自动部署，push 到 GitHub main 即触发
- 无后端，纯前端 SPA

## 二、现有架构

### 三级场景状态机
```
overview (Falcon 9 全景) 
  → 点击火箭底部 
octaweb (9台发动机阵列) 
  → 点击单台发动机 
engine (Merlin 1D 爆炸拆解)
```

### 文件结构（1558 行代码）
```
src/
├── App.tsx (135行)          # 主应用，场景路由 + GSAP过渡 + 按钮控制
├── main.tsx (16行)          # 入口
├── index.css (67行)         # Tailwind theme + glassmorphism 样式
├── data/
│   └── rocketData.ts (219行) # 8个零件数据(LatheGeometry profile + 规格) 
├── hooks/
│   └── useSceneState.ts (61行) # 状态机: mode/explodeProgress/simulating/selectedPart
└── components/
    ├── scene/
    │   ├── SceneContainer.tsx (107行) # R3F Canvas + 相机 + 灯光 + OrbitControls
    │   ├── StarField.tsx (45行)       # 2000个背景星点
    │   ├── OverviewScene.tsx (96行)   # Falcon 9 火箭模型(圆柱体拼接)
    │   ├── OctawebScene.tsx (147行)   # 9台发动机阵列 + 结构环梁
    │   └── MerlinEngine.tsx (451行)   # ★核心: 零件渲染 + 爆炸动画 + 运行模拟
    └── ui/
        ├── Breadcrumb.tsx (46行)      # 左上导航 FALCON9/OCTAWEB/MERLIN
        ├── HUD.tsx (45行)             # 右上状态 + 底部提示
        ├── InfoPanel.tsx (81行)       # 左侧零件详情/右侧规格面板
        └── LoadingScreen.tsx (42行)   # 启动加载动画
```

### 零件数据模型
```typescript
interface EnginePart {
  id: string;              // "nozzle", "combustion-chamber", "injector", "turbopump", ...
  name: string;            // 中文名 "喷管"
  nameEn: string;          // "Nozzle"
  description: string;     // 中文描述
  specs: { label: string; value: string }[];
  assembledPos: [x, y, z]; // 组装位置
  explodedPos: [x, y, z];  // 爆炸位置 (已放大2.5倍)
  color: string;           // 材质颜色
  metalness: number;
  roughness: number;
  geometry: "lathe" | "cylinder" | "torus" | "box" | "sphere" | "cone";
  profile?: [radius, y][]; // LatheGeometry 剖面点
}
```

8 个零件：喷管(Lathe)、燃烧室(Lathe)、喷注器(Lathe)、涡轮泵(Sphere)、燃气发生器(Cylinder)、推力架(Torus)、阀门组件(Box)、点火器(Sphere)

### 当前运行模拟实现
- `simulating` 状态切换时：零件自动组装(explodeProgress→0)
- 燃烧室 emissive 红色 #ff2200 intensity 0.8
- 喷管 emissive #ff4400 intensity 0.5
- 喷注器 emissive 蓝白 #88bbff intensity 0.5
- 燃气发生器 emissive 橙 #ff8800 intensity 0.4
- 涡轮泵 rotation.y 每帧 +delta*30
- EngineFlame: 4层 ShaderMaterial 锥体(渐变透明) + 150个火花粒子 + 动态点光源
- IgnitionSpark: 前1秒白色光球从喷注器下落到燃烧室
- 2个内部 pointLight 透过喷管可见红光

## 三、核心问题（用户反馈）

### 问题1: 整体视觉效果"差强人意"
当前几何体全是基本图元（圆柱、球、圆锥、环）拼接，像"玩具模型"而非工业级展示。需要更精细的几何体或更高级的着色策略。

### 问题2: 运行模拟太简陋
- 燃烧室内部模拟看不到——emissive 只在材质表面发光，用户无法"看进"燃烧室内部
- 火焰是静态锥体+粒子，缺乏真实感
- 点火序列太简单（一个白球下落）
- 缺少推进剂流动的可视化

### 问题3: 爆炸拆解图缺乏标注线
真正的爆炸图有从零件引出的标注线+序号+规格。当前只有悬浮文字标签。

### 问题4: 三级场景之间过渡突兀
GSAP 只做了 opacity 淡出淡入，没有镜头运动/缩放过渡。

## 四、设计约束（必须遵守）

### 硬件约束
- **服务器 2GB RAM, 2 vCPU** — 不能用重型方案
- **无 Docker** — 纯静态构建
- **不能加载外部 3D 模型文件**（.glb/.gltf/.obj）— 所有几何体必须程序化生成
- **不能用 postprocessing**（@react-three/postprocessing）— 内存扛不住 EffectComposer

### 技术约束
- 必须用 R3F v9 + Drei v10 语法（不是裸 Three.js）
- 必须通过 `bunx tsc --noEmit` + `bun run build` 零错误
- 包体积当前 ~1.17MB（gzip 330KB），不要暴增

### 执行约束（CC 能力边界）
- CC 使用 deepseek-v4-flash 模型，单次任务预算 $1-1.2
- CC 单次 prompt 不能超过 ~500 字符（太长会 API 超时）
- CC 产出必有 TS 错误，需 Hermes 审查修复
- 复杂改动需拆分为多个 CC 任务，每个 3-5 句话描述
- CC 不跑 dev server，只用 tsc + build 验证

### 设计规范（Taste Skill）
- 背景：#0a0a0f (off-black)
- 面板：glassmorphism（半透明+毛玻璃+细边框）
- 强调色：#ff3b30 (SpaceX 红)
- 字体：Geist Sans (UI) + Geist Mono (数据)
- 风格：工业、极简、电影感
- 三 Dial: DESIGN_VARIANCE:8(非对称), MOTION_INTENSITY:9(电影级), VISUAL_DENSITY:3(留白)

## 五、需要高级 AI 出方案的方向

### 方向A: 几何体精度提升
如何在不加载外部模型的前提下，让 Merlin 发动机的零件看起来更真实？
- LatheGeometry 剖面点优化？
- 多层几何体叠加（如喷管外壁+内壁+冷却通道）？
- 用 ShaderMaterial 做金属质感/烧灼痕迹？
- 自定义 BufferGeometry 做更复杂形状？

### 方向B: 运行模拟视觉方案
如何让"看进发动机内部"成为可能？
- 剖切面(ClippingPlane)展示内部？
- 半透明外壳 + 内部粒子流动？
- 燃烧室内部用体积光/体积雾？
- 推进剂管路流动动画？
- 点火序列分阶段（充填→点火→稳定燃烧）？

### 方向C: 爆炸图标注系统
如何实现工业级爆炸图的标注线？
- Drei <Line> 从零件引出到屏幕边缘？
- Html 标签 + SVG 连接线？
- 编号系统(1-8) + 图例？

### 方向D: 场景过渡动画
如何让三级场景之间有电影级过渡？
- 相机飞行动画(GSAP 动画 camera position)？
- 景深变化(fov 动画)？
- 零件组装/拆解的编排动画？

### 方向E: 整体氛围提升
- 灯光方案（三点光？环境光贴图？）
- 后处理替代方案（不用 postprocessing 的情况下）
- 背景方案（不只是星点？发射台环境？）

## 六、现有完整代码

### MerlinEngine.tsx (451行 - 核心文件)
```tsx
// 完整代码见项目文件
// 核心组件:
// - PartMesh: 单个零件渲染, LatheGeometry/Cylinder/Sphere等, 爆炸动画, 选中高亮, Html标签
// - Pipes: 涡轮泵↔燃气发生器 Drei Line 连线, 跟随爆炸位置
// - GradientFlameCone: ShaderMaterial 锥体, y方向渐变透明
// - FlameParticles: 150个点粒子向上飘散
// - EngineFlame: 4层火焰锥(橙→黄→白) + 粒子 + 动态光源
// - IgnitionSpark: 点火光球从y=0.38下落到y=0
// - MerlinEngine: 组合所有组件, 模拟时停止旋转
```

### rocketData.ts 零件数据 (已放大2.5倍)
```
nozzle:            Lathe, profile 9点, assembled [0,-0.88,0], exploded [0,-3.0,0]
combustion-chamber: Lathe, profile 9点, assembled [0,0,0],     exploded [0,0.75,0]
injector:          Lathe, profile 6点, assembled [0,0.38,0],   exploded [0,1.75,0]
turbopump:         Sphere r=0.125,  assembled [0.20,0.13,0],   exploded [1.5,0.25,0]
gas-generator:     Cylinder,        assembled [-0.20,0.13,0],  exploded [-1.38,0.38,0]
thrust-frame:      Torus,           assembled [0,0.63,0],      exploded [0,2.5,0]
valves:            Box,             assembled [0.13,-0.25,0.13],exploded [1.0,-1.0,0.75]
igniter:           Sphere r=0.125,  assembled [0,0.35,0],      exploded [0,2.25,0]
```

### 相机位置
- overview: [0, 0, 4]
- octaweb: [0.5, 0.5, 1.2]
- engine: [2.0, 0.75, 2.5]

### 灯光
- ambient: intensity 0.15
- directional: [5,5,5] intensity 1.5 white
- directional: [-5,3,-5] intensity 0.5 blue
- point: [0,-2,0] intensity 0.8 red distance 5
- Environment preset="night"

## 七、期望输出

请针对以上5个方向(A-E)给出：
1. **具体技术方案**（用什么 R3F/Three.js API，怎么实现）
2. **代码结构建议**（新建什么组件，改什么现有组件）
3. **CC 执行拆分**（每个 CC 任务 3-5 句话 prompt，能在 $1 预算内完成）
4. **优先级排序**（哪个改动视觉提升最大，先做哪个）

方案要贴合现有代码结构，不能推翻重来，只能增量改进。
