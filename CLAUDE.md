# LIE9 - Falcon 9 Explosive View

## 项目概述
SpaceX 猎鹰9号 (Falcon 9) 动态爆炸图展示网站。用户可以交互式地"拆解"火箭，查看每个组件的详细信息。

## 技术栈
- React 19 + TypeScript + Vite
- @react-three/fiber + @react-three/drei (3D 渲染)
- three.js (底层 3D 引擎)
- framer-motion (UI 动画)
- tailwindcss 4 (样式)
- Bun (包管理 + 构建)

## 关键命令
- `bun install` - 安装依赖
- `bun run dev` - 开发服务器 (localhost:5173)
- `bun run build` - 生产构建
- `bun run preview` - 预览构建

## 架构

### 目录结构
```
src/
├── components/
│   ├── scene/           # 3D 场景组件
│   │   ├── RocketScene.tsx      # 主场景容器
│   │   ├── Falcon9.tsx          # 猎鹰9号完整模型
│   │   ├── Stage1.tsx           # 一级火箭 (含9台梅林发动机)
│   │   ├── Stage2.tsx           # 二级火箭
│   │   ├── Fairing.tsx          # 整流罩
│   │   ├── MerlinEngine.tsx     # 单台梅林发动机
│   │   └── EngineParts.tsx      # 发动机零件 (燃烧室/涡轮泵/喷管等)
│   ├── ui/                      # UI 覆盖层
│   │   ├── InfoPanel.tsx        # 组件信息卡片
│   │   ├── Controls.tsx         # 控制按钮 (爆炸/组装/重置)
│   │   └── LoadingScreen.tsx    # 加载动画
│   └── effects/                 # 视觉特效
│       ├── StarField.tsx        # 星空背景
│       └── EngineFlame.tsx      # 发动机火焰
├── data/
│   └── rocketData.ts            # 火箭/发动机数据
├── hooks/
│   └── useExplodeState.ts       # 爆炸状态管理
├── App.tsx
└── main.tsx
```

### 爆炸图核心逻辑
- 使用 React state 控制 `explodeProgress` (0-1)
- 每个组件根据 explodeProgress 和自身 offset 向外位移
- 用 lerp/easing 函数实现平滑动画
- 组件层级：整箭 -> 一级/二级/整流罩 -> 梅林发动机 -> 发动机零件

### 猎鹰9号数据 (真实参数)
- 总高: 70m
- 直径: 3.7m
- 一级: 9台 Merlin 1D 发动机
- 二级: 1台 Merlin 1D Vacuum 发动机
- 推力: 7,607 kN (海平面)

## 代码规范
- TypeScript strict mode
- 文件命名: PascalCase 组件, camelCase 工具
- 所有 3D 组件用 React Three Fiber 声明式写法
- 颜色用十六进制常量，统一在常量文件管理

## 视觉风格
- 深空黑色背景 (#000511)
- 星空粒子效果
- 火箭主体: 金属银白 (#e8e8e8)
- 发动机: 深灰金属 (#4a4a4a)
- 火焰: 橙黄渐变
- UI: 毛玻璃 + SpaceX 风格极简白字

## 禁止事项
- 不要引入 GLTF 模型文件 - 全部用 Three.js 基础几何体程序化生成
- 不要用任何付费 API 或服务
- 不要做 SSR - 纯前端 SPA
